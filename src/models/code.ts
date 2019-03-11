export interface Code {
  code: string,
  createDate: any,
  updateDate: any,
  activateDate?: any,
  uidUser?: string
}
export interface CodeId extends Code {
  id: string;
}
