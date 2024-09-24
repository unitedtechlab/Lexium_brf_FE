import React, { useState, useEffect } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Form, Input } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { MdOutlineOutput } from 'react-icons/md';

const OutputNode: React.FC<NodeProps<any>> = ({ id, data, isConnectable }) => {
    const [outputName, setOutputName] = useState<string>(data.outputName || '');

    const handleOutputNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOutputName(e.target.value);
        data.outputName = e.target.value;  // Ensure outputName is correctly set in node data
    };

    return (
        <div>
            <div className={`${styles['nodeBox']} ${styles.endnode}`} style={{ maxWidth: '340px' }}>
                <Form name={`output-form-${id}`} layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <MdOutlineOutput className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || 'Output Node'}</h6>
                                </div>
                            </div>
                        </div>

                        <div className={`flex gap-1 ${styles.formInput}`}>
                            <Form.Item
                                className={`nodrag ${styles.widthInput} ${styles.fullwidth}`}
                                rules={[{ required: true, message: 'Output name is required' }]}
                            >
                                <Input
                                    placeholder="Enter Output Name"
                                    value={outputName}
                                    onChange={handleOutputNameChange}
                                    className={styles.inputField}
                                />
                            </Form.Item>
                        </div>

                        <Handle
                            type="target"
                            position={Position.Left}
                            isConnectable={isConnectable}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default OutputNode;
