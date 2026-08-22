export const toArray = (...agrs: any[]) => agrs.slice(0,-1);

export const lower = (val:string) => val.toLowerCase();

export const getValue = (val: any, prop: string) => val?.[prop.toLowerCase()] ?? {};

export const get = (val: any) => val ?? {};

export const endDate = (date: string, plus: number)=> {
    let endDate = new Date(date);
    endDate.setDate(endDate.getDate() +plus);

    return endDate.toISOString().split('T')[0];
}