import React, { useState, useEffect } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';
import { Form, Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { GiLogicGateNand } from "react-icons/gi";
import { BsThreeDots } from 'react-icons/bs';

const { Option } = Select;

const GateOperator = ({ id, data }: NodeProps<any>) => {
    const { setNodes } = useReactFlow();
    const [selectedOperator, setSelectedOperator] = useState(data.gateOperator);

    const handleOperatorChange = (value: string) => {
        setSelectedOperator(value);
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, gateOperator: value } } : node
            )
        );
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
            <div className={`${styles['nodeBox']} ${styles.gateOperator}`} style={{ maxWidth: "300px" }}>
                <Form name="gate-operator" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <GiLogicGateNand className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Gate Operator"}</h6>
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
                                    placeholder="Select Gate Operator"
                                    value={selectedOperator}
                                    onChange={handleOperatorChange}
                                >
                                    <Option value="and">And</Option>
                                    <Option value="or">Or</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <Handle type="target" position={Position.Left} />
                        <Handle type="source" position={Position.Right} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default GateOperator;
