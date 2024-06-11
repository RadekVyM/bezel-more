export function shallowEqual(obj1: any, obj2: any) {
    return Object.keys(obj1).every((key) => 
        Object.hasOwn(obj2, key) && obj2[key] === obj1[key]);
}