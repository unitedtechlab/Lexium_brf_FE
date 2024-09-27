import React, { useState, useEffect } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';
import { Form, Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { GiLogicGateNand } from "react-icons/gi";
import { BsThreeDots } from 'react-icons/bs';
import CustomHandle from './CustomHandle';

const { Option } = Select;

const GateOperator = ({ id, data }: NodeProps<any>) => {
    const { setNodes, getEdges, getNode } = useReactFlow();
    const [selectedOperator, setSelectedOperator] = useState(data.gateOperator || '');
    const [connectedVariableType, setConnectedVariableType] = useState<string | null>(null);

    const fetchConnectedVariableType = () => {
        const edges = getEdges();
        const incomingEdge = edges.find(edge => edge.target === id);

        if (incomingEdge) {
            const connectedNode = getNode(incomingEdge.source);
            if (connectedNode?.data?.variableType) {
                setConnectedVariableType(connectedNode.data.variableType);
                setNodes((nodes) =>
                    nodes.map((node) =>
                        node.id === id ? { ...node, data: { ...node.data, variableType: connectedNode.data.variableType } } : node
                    )
                );
            }
        } else {
            setConnectedVariableType(null);
        }
    };

    useEffect(() => {
        fetchConnectedVariableType();
        const interval = setInterval(fetchConnectedVariableType, 500);

        return () => clearInterval(interval);
    }, [getEdges]);

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
                <Form name={`gate-form-${id}`} layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <GiLogicGateNand className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Gate Operator"}</h6>
                                    {connectedVariableType && <span>Type: {connectedVariableType}</span>}
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

                        <CustomHandle
                            nodeId={id}
                            id="source"
                            type="source"
                            position={Position.Right}
                            connectioncount={1}
                            className={styles.customHandle}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default GateOperator;
