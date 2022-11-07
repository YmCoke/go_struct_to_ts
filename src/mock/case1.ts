export default  `
package main
type Game struct {
	ID     int64    \`json:"id"\`
	Status int32    \`json:"status"\`
	Type   []string \`json:"type"\`
}
`;
