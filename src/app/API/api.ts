import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { FolderData, Folder, FileData, Workspace, Workflow } from "@/app/types/interface";
import { getToken } from '@/utils/auth';

const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

interface Columns {
    [key: string]: string;
}

interface FolderDataWithColumns extends FolderData {
    columns: Columns;
}

// Workspace fetch API
export const fetchWorkspaces = async (email: string, setIsLoading: (isLoading: boolean) => void): Promise<Workspace[]> => {
    setIsLoading(true);
    try {
        const response = await axios.get(`${BaseURL}/workspace/${email}`, {
            headers: getAuthHeaders(),
        });

        if (response.status === 200) {
            const data = response.data.data;

            if (Object.keys(data).length === 0) {
                return [];
            } else {
                const flattenedWorkspaces: Workspace[] = Object.keys(data).map((projectId) => ({
                    id: projectId,
                    name: data[projectId].name || projectId,
                    fileSize: data[projectId].fileSize || 'Unknown',
                    lastUpdated: data[projectId].lastUpdated || 'Unknown',
                    cleanDataExist: data[projectId].cleanDataExist,
                    cleanFileSize: data[projectId].cleanFileSize || 'Unknown',
                    cleanLastUpdated: data[projectId].cleanLastUpdated || 'Unknown',
                    workFlowExist: data[projectId].workFlowExist || false,
                }));
                return flattenedWorkspaces;
            }
        } else {
            throw new Error(response.data.error || 'Failed to fetch workspaces.');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching workspaces:', error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || 'Failed to fetch workspaces.');
        } else {
            console.error('Unexpected error fetching workspaces:', error);
            throw new Error('Failed to fetch workspaces.');
        }
    } finally {
        setIsLoading(false);
    }
};

// Folder fetch API
export const fetchFolders = async (email: string, workspaceId: string, setIsLoading: (isLoading: boolean) => void): Promise<FolderDataWithColumns[]> => {
    setIsLoading(true);
    try {
        const response = await axios.get(`${BaseURL}/folder`, {
            params: {
                userEmail: email,
                workSpace: workspaceId,
            },
            headers: getAuthHeaders(),
        });

        if (response.status === 200) {
            const data = response.data.data;
            const fetchedFolders: FolderDataWithColumns[] = Object.keys(data).map((folderId) => {
                const folder: FolderDataWithColumns = {
                    id: folderId,
                    name: data[folderId].name || folderId,
                    fileSize: data[folderId].fileSize || 'Unknown',
                    lastUpdated: data[folderId].lastUpdated || 'Unknown',
                    cleanDataExist: data[folderId].cleanDataExist || false,
                    cleanLastUpdated: data[folderId].cleanLastUpdated || 'Unknown',
                    cleanFileSize: data[folderId].cleanFileSize || 'Unknown',
                    columnsEstablised: data[folderId].columnsEstablised || false,
                    columns: data[folderId].columns || {},
                };
                return folder;
            });
            return fetchedFolders;
        } else if (response.status === 404) {
            return [];
        } else {
            throw new Error(response.data.error || 'Failed to fetch folders.');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching folders:', error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || 'Failed to fetch folders.');
        } else {
            console.error('Unexpected error fetching folders:', error);
            throw new Error('Failed to fetch folders.');
        }
    } finally {
        setIsLoading(false);
    }
};

// File fetch API
export const fetchFiles = async (email: string, workspaceId: string, folderName: string, setIsLoading: (isLoading: boolean) => void): Promise<FileData[]> => {
    setIsLoading(true);
    try {
        const response = await axios.get(`${BaseURL}/file`, {
            params: {
                userEmail: email,
                workSpace: workspaceId,
                folderName: folderName,
            },
            headers: getAuthHeaders(),
        });

        if (response.status === 200) {
            const data = response.data.data;
            const fetchedFiles: FileData[] = Object.keys(data).map((fileId) => ({
                id: fileId,
                name: fileId,
                fileSize: data[fileId].fileSize || 'Unknown',
                lastUpdated: data[fileId].lastUpdated || 'Unknown',
                established: data[fileId].columnEstablished,
            }));
            return fetchedFiles;
        } else {
            throw new Error(response.data.error || 'Failed to fetch files.');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching files:', error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || 'Failed to fetch files.');
        } else {
            console.error('Unexpected error fetching files:', error);
            throw new Error('Failed to fetch files.');
        }
    } finally {
        setIsLoading(false);
    }
};


export const fetchFolderData = async (email: string, workspaceId: string, folderId: string) => {
    try {
        const response = await axios.get(`${BaseURL}/specific_folder`, {
            params: {
                userEmail: email,
                workSpace: workspaceId,
                folderName: folderId,
            },
            headers: getAuthHeaders(),
        });

        if (response.status === 200) {
            const data = response.data.data;
            const confirmedDataType = data.confirmedDataType;
            if (confirmedDataType && typeof confirmedDataType === 'object') {
                return confirmedDataType;
            } else {
                console.error('No confirmedDataType found or data is not an object:', confirmedDataType);
                return {};
            }
        } else {
            throw new Error(response.data.error || 'Failed to fetch folder data.');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching folder data:', error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || 'Failed to fetch folder data.');
        } else {
            console.error('Unexpected error fetching folder data:', error);
            throw new Error('Failed to fetch folder data.');
        }
    }
};


// Pre-validate data API
export const preValidateData = async (requestData: {
    userEmail: string;
    workSpace: string;
    folderName: string;
    data: {
        dataType: { [key: string]: string };
        missingValue: { [key: string]: string };
        keys: string[];
    };
}) => {
    try {
        const response = await axios.post(`${BaseURL}/pre_validation`, requestData, {
            headers: getAuthHeaders(),
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.error || 'Failed to complete data pre-validation.');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error during data pre-validation:', error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || 'Failed to complete data pre-validation.');
        } else {
            console.error('Unexpected error during data pre-validation:', error);
            throw new Error('Failed to complete data pre-validation.');
        }
    }
};


// Get Workflow API

export const fetchWorkflows = async (email: string, workspaceId: string, setIsLoading: (isLoading: boolean) => void): Promise<Workflow[]> => {
    setIsLoading(true);
    try {
        const response = await axios.get(`${BaseURL}/workflow`, {
            params: {
                userEmail: email,
                workSpace: workspaceId,
            },
            headers: getAuthHeaders(),
        });

        if (response.status === 200) {
            const workflows = response.data.data;
            const formattedWorkflows: Workflow[] = Object.keys(workflows).map((workflowName) => ({
                id: workflowName,
                name: workflowName,
                size: workflows[workflowName].size || 'Unknown',
                lastUpdated: workflows[workflowName].lastUpdated || 'Unknown',
            }));
            return formattedWorkflows;
        } else {
            throw new Error(response.data.error || 'Failed to fetch workflows.');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching workflows:', error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || 'Failed to fetch workflows.');
        } else {
            console.error('Unexpected error fetching workflows:', error);
            throw new Error('Failed to fetch workflows.');
        }
    } finally {
        setIsLoading(false);
    }
};