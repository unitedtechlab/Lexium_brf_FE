import React, { useEffect, useState } from 'react';
import { Modal, Table, message, Button, Checkbox } from 'antd';
import axios from 'axios';
import { BaseURL } from "@/app/constants/index";
import { useEmail } from "@/app/context/emailContext";
import { getToken } from '@/utils/auth';
import type { ColumnType } from 'antd/es/table';

interface CompositeKeyModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    workSpace: string;
    folderName: string;
    onSave: (selectedColumns: string[]) => void;
}

interface FolderData {
    id: string;
    column: string;
    selected: boolean;
}

const CompositeKeyModal: React.FC<CompositeKeyModalProps> = ({ isModalOpen, setIsModalOpen, workSpace, folderName, onSave }) => {
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<FolderData[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<{ [key: string]: boolean }>({});

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = getToken();
            const response = await axios.get(`${BaseURL}/folder`, {
                params: {
                    userEmail: email,
                    workSpace: workSpace,
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                const folderData = response.data.data[folderName];
                const columns = folderData.columns || {};
                const formattedData = Object.keys(columns).map((key, index) => ({
                    id: (index + 1).toString(),
                    column: columns[key],
                    selected: false,
                }));

                setData(formattedData);
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
        if (isModalOpen && email && workSpace && folderName) {
            fetchData();
        }
    }, [isModalOpen, email, workSpace, folderName]);

    const handleCheckboxChange = (key: string) => {
        setSelectedKeys(prevState => ({
            ...prevState,
            [key]: !prevState[key],
        }));
    };

    const handleOk = async () => {
        const selectedColumns = data.filter(item => selectedKeys[item.id]).map(item => item.column);

        if (selectedColumns.length < 2) {
            message.error("Please select at least two columns.");
            return;
        }

        onSave(selectedColumns);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const compositeTableColumns: ColumnType<FolderData>[] = [
        {
            title: 'Column',
            dataIndex: 'column',
            key: 'column',
        },
        {
            title: 'Select',
            key: 'select',
            render: (_: any, record: { id: string }) => (
                <Checkbox
                    checked={selectedKeys[record.id] || false}
                    onChange={() => handleCheckboxChange(record.id)}
                />
            ),
        },
    ];

    return (
        <Modal
            title="Composite Key"
            centered
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
                <Button key="submit" type="primary" onClick={handleOk} className='btn'>
                    Assign as a composite key
                </Button>,
            ]}
        >
            <Table columns={compositeTableColumns} dataSource={data} loading={isLoading} pagination={false} />
        </Modal>
    );
};

export default CompositeKeyModal;
