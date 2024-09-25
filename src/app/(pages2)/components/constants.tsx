import React, { useState, useEffect } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';
import { Form, Input, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { AiOutlineNumber } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';

const ConstantNode = ({ id, data, type }: NodeProps<any>) => {
    const { getEdges, getNodes, setNodes } = useReactFlow();
    const [inputValue, setInputValue] = useState<string>('');
    const [valueType, setValueType] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const determineValueType = (value: string) => {
        if (value !== '') {
            return 'number';
        } else {
            return null;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^-?\d*\.?\d*$/.test(value)) {
            setInputValue(value);
            const valueType = determineValueType(value);
            setValueType(valueType);

            data.value = value;
            data.variableType = valueType;
        }
    };

    useEffect(() => {
        if (data.value) {
            setInputValue(data.value);
            setValueType(data.variableType || determineValueType(data.value));
        }
    }, [data.value, data.variableType]);

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter(node => node.id !== id));
        message.success('Node deleted successfully');
    };

    const openGlobalVariableModal = () => {
        setIsModalVisible(true);
    };

    const handleSaveAsGlobalVariable = (globalVariableName: string) => {
        if (!inputValue) {
            message.error("No value to save as a global variable.");
            return;
        }

        const globalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
        const newGlobalVariable = {
            GlobalVariableName: globalVariableName,
            type: 'constant',
            nodeID: id,
            value: inputValue,
            variableType: valueType || 'unknown',
        };

        globalVariables.push(newGlobalVariable);
        localStorage.setItem('GlobalVariables', JSON.stringify(globalVariables));

        message.success('Constant saved as global variable.');
        window.dispatchEvent(new Event('globalVariableUpdated'));
        setIsModalVisible(false);
    };

    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode
        },
        {
            label: 'Save as a Global variable',
            key: '1',
            onClick: openGlobalVariableModal
        }
    ];

    return (
        <div>
            <div className={`${styles['nodeBox']} ${styles.constant}`} style={{ maxWidth: "250px" }}>
                <Form name="constant-value" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <AiOutlineNumber className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Addition / Subtraction"}</h6>
                                    {valueType && (
                                        <span>Type: {valueType}</span>
                                    )}
                                </div>
                            </div>
                            <Dropdown
                                menu={{ items: menuItems }}
                                trigger={['click']}
                            >
                                <a onClick={(e) => e.preventDefault()} className='iconFont'>
                                    <BsThreeDots />
                                </a>
                            </Dropdown>
                        </div>

                        <div className={`flex gap-1 ${styles.formInput}`}>
                            <Form.Item
                                className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}
                            >
                                <Input
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Enter Constant value"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                />
                            </Form.Item>
                        </div>
                        <Handle type="source" position={Position.Right} />
                    </div>
                </Form>

                <SaveGlobalVariableModal
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    onSave={handleSaveAsGlobalVariable}
                />
            </div>
        </div>
    );
};

export default ConstantNode;
