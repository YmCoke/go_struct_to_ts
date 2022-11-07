const TYPE_MAP = {
  int: 'number',
  int32: "number",
  int64: "number",
  bool: 'boolean',
  "operationDal.Image": "IFileInfo",
  Video: "IVideoInfo",
};

export default function parse(data) {
  const ast = data.ast;
  const decl = ast.children[1];
  const fieldMap = new Map();
  for (const node of decl.children) {
    if (!isTypeNode(node)) continue;
    const spec = node.children[0];
    const struct = spec.children[0];
    const identify = struct.children[0];
    const structType = struct.children[1];

    const name = identify.attrs.Name;
    const fields = formatFieldList(structType.children[0]);
    fieldMap.set(
      name,
      fields.map((field) => ({ ...field, field: decodeTag(field.tag) }))
    );
  }

  const result = transformToInterface(fieldMap);
  return result;
}

/** 返回node是否为type */
function isTypeNode(node) {
  return node.attrs.Tok === "type";
}

/** 格式化fieldList */
function formatFieldList(fieldList) {
  const list = fieldList.children[0];
  const res = [];
  for (const field of list.children) {
    if (field.children[0].label === "Doc : *ast.CommentGroup") {
      field.children.shift();
    }
    const [nameNode, typeNode, tagNode] = field.children;
    const key = nameNode.children[0].attrs.Name;
    let type = dealTypeNode(typeNode);
    const tag = tagNode.attrs.Value;
    if (type.includes("undefined")) {
      console.warn("存在数据为空的情况：", { key, type, tag, field });
    }
    res.push({
      key,
      type,
      tag,
    });
  }
  return res;
}

/** 分类处理TypeNode */
function dealTypeNode(typeNode) {
  switch (typeNode.label) {
    case "Type : *ast.ArrayType":
      return "[]" + dealTypeNode(typeNode.children[0]);
    case "Type : *ast.StarExpr":
      return dealTypeNode(typeNode.children[0]);
    case "X : *ast.SelectorExpr":
    case "Type : *ast.SelectorExpr":
    case "Elt : *ast.StarExpr":
      return typeNode.children.map(dealTypeNode).join(".");
    default: {
      return typeNode.attrs.Name;
    }
  }
}

/** 解析tag */
function decodeTag(tagStr) {
  tagStr = tagStr.substr(1, tagStr.length - 2);
  const tagList = tagStr.split(" ");
  let res;
  for (const tag of tagList) {
    if (!tag.includes(":")) continue;
    const [_, field] = tag.split(":");
    if (!["json", "form"].includes(_)) continue;
    if (!res) res = field;
    else if (res != field)
      throw new Error(`${tagStr}解析存在问题, tag注释必须满足field是相同的`);
  }
  return res;
}

/** 生成TS interface */
function transformToInterface(fieldMap) {
  const res = [];
  fieldMap.forEach((fieldList, identify) => {
    const fieldListStr = fieldList.map(
      ({ field, type }) =>
        // 此时的field带了引号，如"game_id", 需要转化为game_id，去掉前后的引号
        `\t${field.substr(1, field.length - 2)}: ${mapGoToTsType(type)};\n`
    );
    res.push(`
  interface ${identify} {
  ${fieldListStr.join("")}}
          `);
  });
  return res.join("\n");
}

/** 类型映射 */
function mapGoToTsType(type) {
  let arrayType = false;
  if (type.startsWith("[]")) {
    type = type.substr(2);
    arrayType = true;
  }
  let result = TYPE_MAP[type] || type;
  if (arrayType) result += "[]";
  return result;
}
