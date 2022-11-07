export default {
    primary: (component: string, message: string, payload?: any) => {
        console.log(`${component}: ${message}`, {payload});
    },
    warning: (component: string, message: string, payload?: any) => {
        console.warn(`${component}: ${message}`, {payload});
    },
    success: (component: string, message: string, payload?: any) => {
        console.log(`${component}: ${message}`, {payload});
    },
    error: (component: string, message: string, payload?: any) => {
        console.error(`${component}: ${message}`, {payload});
    },
}