'use client';

import React, { useState, useEffect } from 'react';
import { Button, Col, Row, Form, Input, Upload, message, Progress, Spin } from 'antd';
import classes from '@/app/assets/css/pages.module.css';
import { IoMdCloseCircle } from 'react-icons/io';
import { RiDeleteBin6Fill, RiLoader2Fill, RiCheckboxCircleFill } from 'react-icons/ri';
import fileIcon from '@/app/assets/images/fileIcon.svg';
import axios, { AxiosError } from 'axios';
import { BaseURL } from '@/app/constants/index';
import Image from 'next/image';
import DataSuccessfulModal from '../modals/data-upload-success/data-upload-success';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useEmail } from '@/app/context/emailContext';
import Link from 'next/link';
import { getToken } from '@/utils/auth';

const ImportFilePage: React.FC = () => {
    const [form] = Form.useForm();
    const { id } = useParams();
    const searchParams = useSearchParams();
    const { email } = useEmail();
    const router = useRouter();

    const [fileTypes, setFileTypes] = useState<string[]>([]);
    const [remainingBucketSize, setRemainingFileSize] = useState<number>(0);
    const [totalBucketSize, setTotalBucketSize] = useState<number>(0);
    const [workspaceId, setWorkspaceId] = useState<string>('');
    const [folderName, setFolderName] = useState<string>('');
    const [fileList, setFileList] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [successfulFiles, setSuccessfulFiles] = useState<string[]>([]);
    const [unsuccessfulFiles, setUnsuccessfulFiles] = useState<{ name: string, message: string }[]>([]);
    const token = getToken();

    const handleRemove = (file: any) => {
        const index = fileList.indexOf(file);
        const newFileList = [...fileList];
        newFileList.splice(index, 1);
        setFileList(newFileList);
    };

    const handleUpload = () => {
        setIsModalVisible(true);
    };

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseURL}/bucket_details/${email}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                const { fileTypes = [], remainingBucketSize = 0, totalBucketSize = 0 } = response.data.data;
                setFileTypes(fileTypes);
                setRemainingFileSize(remainingBucketSize);
                setTotalBucketSize(totalBucketSize);
            } else {
                message.error(response.data.message || 'Failed to fetch file space.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                message.error(error.response?.data?.message || error.message);
            } else {
                console.error('Unexpected error fetching user data:', error);
                message.error('Failed to fetch user data. Check console for details.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFile = async () => {
        const formData = new FormData();

        fileList.forEach(file => {
            if (email) {
                formData.append('userEmail', email);
            }
            formData.append('files', file.originFileObj);
            formData.append('workSpace', workspaceId);
            formData.append('folderName', folderName);
        });

        setLoading(true);
        try {
            const response = await axios.post(`${BaseURL}/file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                const successFiles = fileList.map(file => file.name);
                setSuccessfulFiles(successFiles);
                setUnsuccessfulFiles([]);
                setIsModalVisible(false);
                setFileList([]);
                router.push(`/importdata/${id}?workspace=${id}&folder=${folderName}`);
                message.success("File Uploaded successfully.");
            } else {
                const errorMessages = response.data.error;
                const successFiles = fileList
                    .filter(file => !errorMessages[file.name])
                    .map(file => file.name);
                const errorFiles = Object.keys(errorMessages).map(fileName => ({
                    name: fileName,
                    message: errorMessages[fileName],
                }));
                setSuccessfulFiles(successFiles);
                setUnsuccessfulFiles(errorFiles);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                const errorResponse = error.response?.data;
                if (errorResponse && errorResponse.error) {
                    const errorMessages = errorResponse.error;
                    const successFiles = fileList
                        .filter(file => !errorMessages[file.name])
                        .map(file => file.name);
                    const errorFiles = Object.keys(errorMessages).map(fileName => ({
                        name: fileName,
                        message: errorMessages[fileName],
                    }));
                    setSuccessfulFiles(successFiles);
                    setUnsuccessfulFiles(errorFiles);
                } else {
                    message.error(error.message);
                }
            } else {
                console.error('Unexpected error uploading file:', error);
                message.error('Failed to upload file. Check console for details.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCleanDataNow = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        const workspace = searchParams.get('workspace');
        const folder = searchParams.get('folder');
        if (workspace) {
            form.setFieldsValue({ workspace });
            setWorkspaceId(workspace);
        }

        if (folder) {
            form.setFieldsValue({ folder });
            setFolderName(folder);
        }

        fetchUserData();

    }, [searchParams, form, fileList]);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={classes.importdatadetails}>
            <div className={`${classes.dataheader} flex alinc justify-space-between gap-1`}>
                <div className={classes.headname}>
                    <h5>Import Data</h5>
                    <p>Import data from {fileTypes} files</p>
                </div>
                <div className={`${classes.headbtn} flex alinc gap-1`}>
                    <Link href={`/importdata/${id}?workspace=${id}&folder=${folderName}`} passHref className="btn btn-outline">
                        Discard
                    </Link>
                    <Button className="btn" onClick={handleUpload} disabled={fileList.length === 0}>
                        Import
                    </Button>
                </div>
            </div>

            <div className={classes.dataform}>
                <Row gutter={16}>
                    <Col md={12} span={24}>
                        <div className={classes.formcol}>
                            <Form layout="vertical" autoComplete="off" scrollToFirstError form={form} id='importfile-form'>
                                <Row gutter={16}>
                                    <Col md={12} span={24}>
                                        <Form.Item name="workspace" label="Workspace" initialValue={searchParams.get('workspace') || ''}>
                                            <Input placeholder="Enter workspace name" className="forminput" disabled id='workspace-name' />
                                        </Form.Item>
                                    </Col>
                                    <Col md={12} span={24}>
                                        <Form.Item name="folder" label="Folder" initialValue={searchParams.get('folder') || ''}>
                                            <Input placeholder="Enter folder name" className="forminput" disabled id='folder-name' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item name="filetype" label="File Type">
                                    <div className="forminput">
                                        <span>{fileTypes}</span>
                                    </div>
                                </Form.Item>
                                <Form.Item name="location" label="Data Location" rules={[{ required: true, message: 'Please upload a file' }]}>
                                    <div className={classes.filechoose}>
                                        <h6>File</h6>
                                        <Upload
                                            className={classes.uploadBtn}
                                            fileList={fileList}
                                            onChange={({ fileList }) => setFileList(fileList)}
                                            onRemove={handleRemove}
                                            multiple={true}
                                            showUploadList={false}
                                            id='upload-file'
                                        >
                                            <Button>Choose File</Button>
                                        </Upload>
                                        <div className={classes.notes}>
                                            <p>(Supported file formats: .CSV, .XLS and other text files)</p>
                                            <p>Note:</p>
                                            <ul>
                                                <li>For other file formats, choose the corresponding 'File Type' option above.</li>
                                                <li>For large size CSV or XLS or Text file, we recommend zipping it and uploading.</li>
                                                <li>Zipped CSV, XLS, or Text file should contain only one file in it.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </Form.Item>
                            </Form>
                        </div>
                    </Col>
                    <Col md={12} span={24}>
                        <div className={classes.datauploaded}>
                            <div className={classes.dataNote}>
                                <p><b>General Info:</b></p>
                                <p>Data size should be less than 100 MB and the number of rows should be less than 1 million.</p>
                                <p>To upload more, ensure your data is in CSV or XLS text file formats.</p>
                                <p>Contact support@kainest.com for any assistance.</p>
                                <p>
                                    <b>Total bucket Size: {totalBucketSize}</b><br />
                                    <b>Remaining Bucket size: {remainingBucketSize}</b>
                                </p>
                            </div>
                            <div className={classes.fileuploaded}>
                                <h6>File Uploaded</h6>
                                <div className={classes.fileuploadedListWrapper}>
                                    {fileList.map((file, index) => (
                                        <div key={index} className={`${classes.fileuploadedList} flex gap-1`}>
                                            <Image src={fileIcon} alt="File Upload Icon" width={32} height={32} />
                                            <div className={classes.filenameSize}>
                                                <p>{file.name}</p>
                                                <ul className={`flex gap-1 ${classes.fileListData}`}>
                                                    <li>
                                                        Uploaded File Size - {formatFileSize(file.size)}
                                                    </li>
                                                    {file.status === 'uploading' ? (
                                                        <li>
                                                            <RiLoader2Fill style={{ color: '#000', fontSize: '16px' }} /> Uploading...
                                                        </li>
                                                    ) : (
                                                        <li>
                                                            <RiCheckboxCircleFill style={{ color: '#52c41a', fontSize: '16px' }} /> Completed
                                                        </li>
                                                    )}
                                                </ul>
                                                <div className={classes.progressbar}>
                                                    <Progress percent={file.status === 'uploading' ? Math.floor(file.percent || 0) : 100} showInfo={false} />
                                                </div>
                                            </div>
                                            <Button className={classes.iconBtn} onClick={() => handleRemove(file)}>
                                                {file.status === 'uploading' ? <IoMdCloseCircle /> : <RiDeleteBin6Fill />}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            <DataSuccessfulModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmitFile}
                onCleanDataNow={handleCleanDataNow}
                successfulFiles={successfulFiles}
                unsuccessfulFiles={unsuccessfulFiles}
            />
        </div>
    );
};

export default ImportFilePage;
