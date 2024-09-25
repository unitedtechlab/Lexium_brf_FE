import React, { useState, useEffect } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';
import { Form, Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { SiLocal } from "react-icons/si";
import { BsThreeDots } from 'react-icons/bs';

const { Option } = Select;

const LocalVariableNode = ({ id, data, type }: NodeProps<any>) => {
    const { setNodes } = useReactFlow();
    const [localVariables, setLocalVariables] = useState<any[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string | null>(data.selectedVariable || null);
    const [variableValue, setVariableValue] = useState<string>(data.value || '');
    const [valueType, setValueType] = useState<string | null>(data.variableType || null);

    useEffect(() => {
        const storedVariables = JSON.parse(localStorage.getItem('localVariables') || '[]');
        setLocalVariables(storedVariables);
    }, []);

    const handleSelectChange = (value: string) => {
        setSelectedVariable(value);
        const foundVariable = localVariables.find(variable => variable.name === value);
        if (foundVariable) {
            setVariableValue(foundVariable.value || '');
            setValueType(foundVariable.type || 'number');
        }

        data.selectedVariable = foundVariable?.name;
        data.value = foundVariable?.value;
        data.variableType = foundVariable?.type;
    };

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        message.success('Node deleted successfully');
    };

    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode
        }
    ];

    return (
        <div>
            <div className={`${styles['nodeBox']} ${styles.localVariable}`} style={{ maxWidth: "340px" }}>
                <Form name="local-variable" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <SiLocal className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Local Variable"}</h6>
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
                            <Form.Item className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}>
                                <Select
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Select a Variable"
                                    onChange={handleSelectChange}
                                    value={selectedVariable}
                                >
                                    {localVariables.map((variable, index) => (
                                        <Option key={index} value={variable.name}>
                                            {variable.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        <Handle
                            type="target"
                            position={Position.Left}
                        />
                        <Handle
                            type="source"
                            position={Position.Right}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default LocalVariableNode;
