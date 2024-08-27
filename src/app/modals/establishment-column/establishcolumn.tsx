import React, { useState, useEffect } from 'react';
import { Modal, Table, message, Button } from 'antd';
import axios from 'axios';
import { BaseURL } from "@/app/constants/index";
import { useEmail } from "@/app/context/emailContext";
import Loader from '@/app/loading';
import { getToken } from '@/utils/auth';

interface EstablishmentColumnProps {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    workSpace: string;
    folderName: string;
    fileName: string;
    onSave: (columnsData: { [key: string]: string }) => void;
}

const EstablishmentColumnModal: React.FC<EstablishmentColumnProps> = ({ isModalOpen, setIsModalOpen, workSpace, folderName, fileName, onSave }) => {
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    const fetchFileColumns = async () => {
        setIsLoading(true);
        const params = {
            userEmail: email,
            workSpace,
            folderName,
            fileName,
        };

        try {
            const token = getToken();
            const response = await axios.get(`${BaseURL}/get_file_columns`, {
                params,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200 && response.data) {
                const columnNames = response.data.data.columnNames;

                const tableData = Object.keys(columnNames).map((key, index) => ({
                    key: key,
                    slNo: key,
                    columnName: columnNames[key],
                }));
                setData(tableData);
            } else {
                message.error("Failed to fetch columns from the server.");
            }
        } catch (error) {
            console.error("Error fetching column names:", error);
            message.error("Failed to fetch columns due to an error.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            fetchFileColumns();
        }
    }, [isModalOpen]);

    const handleOk = () => {
        const columnsData = data.reduce((acc: { [key: string]: string }, item) => {
            acc[item.slNo] = item.columnName;
            return acc;
        }, {});

        onSave(columnsData);

        console.log(columnsData, "columnsData columnsData")
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const columns = [
        {
            title: 'SL NO',
            dataIndex: 'slNo',
            key: 'slNo',
            render: (text: any) => <div className="table-cell">{text}</div>,
        },
        {
            title: 'COLUMN',
            dataIndex: 'columnName',
            key: 'columnName',
            render: (text: any) => <div className="table-cell">{text}</div>,
        },
    ];

    return (
        <Modal
            title={fileName}
            centered
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
                <Button key="submit" type="primary" onClick={handleOk} className='btn'>
                    Save
                </Button>,
            ]}
        >
            {isLoading ? (
                <Loader />
            ) : (
                <Table className='modal-table' dataSource={data} columns={columns} pagination={false} />
            )}
        </Modal>
    );
};

export default EstablishmentColumnModal;
