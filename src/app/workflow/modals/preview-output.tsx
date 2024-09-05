import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Table, message } from 'antd';
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { useEmail } from '@/app/context/emailContext';
import classes from '@/app/assets/css/pages.module.css';
import dynamic from 'next/dynamic';
import { getToken } from '@/utils/auth';

const Loader = dynamic(() => import('@/app/loading'), { ssr: false });

interface PreviewOutputModalProps {
    visible: boolean;
    onCancel: () => void;
    workspaceId: string;
    workflowName: string;
    outputId: string;
    nodeType: string;
    outputName: string; // Add outputName prop
}

interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
}

interface FolderData {
    [key: string]: any;
    id: string;
}

const PreviewOutput: React.FC<PreviewOutputModalProps> = ({ visible, onCancel, workspaceId, workflowName, outputId, nodeType, outputName }) => {
    const [data, setData] = useState<FolderData[]>([]);
    const [columns, setColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { email } = useEmail();
    const token = useMemo(() => getToken(), []);

    const convertToCSV = (data: FolderData[], columns: TableColumn[]): string => {
        const csvRows: string[] = [];

        const headers = columns.map(col => col.title).join(',');
        csvRows.push(headers);

        data.forEach(row => {
            const values = columns.map(col => {
                const value = row[col.dataIndex];
                return `"${(value || '').toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    };

    const handleExportCSV = () => {
        if (data.length === 0 || columns.length === 0) {
            message.warning("No data available to export.");
            return;
        }

        const csvData = convertToCSV(data, columns);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `workflow_output_${outputId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            console.log('Fetching data for workflow:', workflowName);

            const response = await axios.get(`${BaseURL}/run_workflow`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                    workflowName: workflowName,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                const outputData = response.data.data;
                console.log("Fetched Workflow Output:", outputData);

                const flattenedData = [];
                for (const ruleKey in outputData) {
                    const rule = outputData[ruleKey];
                    for (const nodeKey in rule) {
                        if (nodeKey === outputId) {
                            const nodeData = rule[nodeKey];
                            flattenedData.push(...nodeData);
                        }
                    }
                }

                if (flattenedData.length > 0) {
                    const columnHeaders: TableColumn[] = Object.keys(flattenedData[0]).map((key) => ({
                        title: key,
                        dataIndex: key,
                        key: key,
                        render: (text: string) => (
                            <div className={classes.tableBody}>{text}</div>
                        ),
                    }));
                    setColumns(columnHeaders);
                }
                setData(flattenedData);
            } else {
                message.error("Failed to fetch workflow output.");
                console.error("Unexpected response:", response);
            }
        } catch (error) {
            console.error("Error fetching workflow output:", error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error || error.message;
                message.error(`Failed to fetch workflow output: ${errorMessage}`);
            } else {
                message.error("An unexpected error occurred while fetching workflow output.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible, workspaceId, workflowName, outputId]);

    return (
        <Modal
            title={`Preview Output File: ${outputName}`}
            width={'90%'}
            open={visible}
            centered
            onCancel={onCancel}
            footer={[
                ...(nodeType === 'output' ? [
                    <Button key="export" className='btn' onClick={handleExportCSV}>
                        Export File
                    </Button>
                ] : []),
                <Button key="cancel" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </Button>,
            ]}
        >
            <div className="clean_data_table">
                <div className="heading">
                    <h6>{`${nodeType} Node`}</h6>
                </div>
                {isLoading ? (
                    <Loader />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey={(record) => record.id || Math.random().toString()}
                        pagination={{
                            position: ['bottomLeft'],
                        }}
                        className="prevalidationTable PreviewOutputtable"
                    />
                )}
            </div>
        </Modal>
    );
};

export default PreviewOutput;
