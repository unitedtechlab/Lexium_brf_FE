import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Table, message } from 'antd';
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { useEmail } from '@/app/context/emailContext';
import classes from '@/app/assets/css/pages.module.css';
import dynamic from 'next/dynamic';
import { getToken } from '@/utils/auth';

const Loader = dynamic(() => import('@/app/loading'), { ssr: false });

interface FolderPreviewModalProps {
    visible: boolean;
    onCancel: () => void;
    workspaceId: string;
    folderName: string;
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

const FolderPreview: React.FC<FolderPreviewModalProps> = ({ visible, onCancel, workspaceId, folderName }) => {
    const [data, setData] = useState<FolderData[]>([]);
    const [columns, setColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { email } = useEmail();
    const token = useMemo(() => getToken(), []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BaseURL}/cleaned_data`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                    folderName: folderName,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                const rows = response.data.data;

                if (rows.length > 0) {
                    const columnHeaders: TableColumn[] = Object.keys(rows[0]).map((key) => ({
                        title: key,
                        dataIndex: key,
                        key: key,
                        render: (text: string) => (
                            <div className={classes.tableBody}>{text}</div>
                        ),
                    }));
                    setColumns(columnHeaders);
                }
                setData(rows);
            } else {
                message.error("Failed to fetch folder data.");
            }
        } catch (error) {
            console.error("Error fetching folder data:", error);
            message.error("Failed to fetch folder data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible, workspaceId, folderName]);

    return (
        <Modal
            title="Preview Cleaned File"
            width={'90%'}
            open={visible}
            centered
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </Button>,
            ]}
        >
            <div className="clean_data_table">
                <div className="heading">
                    <h6>{folderName}</h6>
                </div>
                {isLoading ? (
                    <Loader />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey={(record) => record.id}
                        pagination={{
                            position: ['bottomLeft'],
                        }}
                        className="prevalidationTable folderPreviewtable"
                    />
                )}
            </div>
        </Modal>
    );
};

export default FolderPreview;
