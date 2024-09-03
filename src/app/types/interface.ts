export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Folder {
  id: string;
  name: string;
}

export interface DataType {
  key: string;
  column: string;
  datatype: string;
  confirmDataType: string;
  missingvalue: number;
  duplicatevalue: string;
  primarykey: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  fileSize: string;
  lastUpdated: string;
  cleanDataExist: boolean;
  cleanFileSize: string;
  cleanLastUpdated: string;
  workFlowExist: boolean;
  workspaceID: string;
}
export interface FolderData {
  id: string;
  name: string;
  fileSize: string;
  lastUpdated: string;
  cleanDataExist: boolean;
  cleanFileSize: string;
  cleanLastUpdated: string;
  columnsEstablised: boolean;
  columns?: { [key: string]: string };
}

export interface FileData {
  id: string;
  name: string;
  fileSize: string;
  lastUpdated: string;
  established: boolean;
}


export interface Workflow {
  id: string;
  name: string;
  size: string;
  lastUpdated: string;
}