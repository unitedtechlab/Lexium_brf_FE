import React, { useState, useEffect, useRef } from 'react';
import { Handle, NodeProps, Position, useReactFlow, Connection } from 'reactflow';
import { Form, Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { GiLogicGateNand } from "react-icons/gi";
import { BsThreeDots } from 'react-icons/bs';

const { Option } = Select;

const ConditionalNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [selectedOperator, setSelectedOperator] = useState(data.gateOperator || 'Equal to');
    const [lhsValue, setLhsValue] = useState<string | null>(null);
    const [rhsValue, setRhsValue] = useState<string | null>(null);
    const [lhsType, setLhsType] = useState<string | null>(null);
    const [rhsType, setRhsType] = useState<string | null>(null);
    const errorShownRef = useRef({ target1: false, target2: false });

    // Effect to fetch node values for LHS and RHS whenever connections change
    useEffect(() => {
        const edges = getEdges().filter(edge => edge.target === id);
        edges.forEach((edge) => {
            const connectedNode = getNode(edge.source);
            if (edge.targetHandle === 'target1' && connectedNode) {
                setLhsValue(connectedNode.data.value);
                setLhsType(connectedNode.data.variableType);
            }
            if (edge.targetHandle === 'target2' && connectedNode) {
                setRhsValue(connectedNode.data.value);
                setRhsType(connectedNode.data.variableType);
            }
        });
    }, [getEdges, getNode, id]);

    // Update the operator and ensure the nodes reflect the change
    const handleOperatorChange = (value: string) => {
        setSelectedOperator(value);
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, gateOperator: value } } : node
            )
        );
    };

    const isValidConnection = (connection: Connection) => {
        const edges = getEdges().filter((edge) => edge.target === id);

        if (connection.targetHandle === 'target1' && edges.some(edge => edge.targetHandle === 'target1')) {
            if (!errorShownRef.current.target1) {
                message.error('Only one connection is allowed on LHS (target1).');
                errorShownRef.current.target1 = true;
                setTimeout(() => {
                    errorShownRef.current.target1 = false;
                }, 2000);
            }
            return false;
        }

        if (connection.targetHandle === 'target2' && edges.some(edge => edge.targetHandle === 'target2')) {
            if (!errorShownRef.current.target2) {
                message.error('Only one connection is allowed on RHS (target2).');
                errorShownRef.current.target2 = true;
                setTimeout(() => {
                    errorShownRef.current.target2 = false;
                }, 2000);
            }
            return false;
        }

        return true;
    };

    // Handle delete node
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

    // Function to dynamically return the text showing the LHS, operator, and RHS values
    const getDynamicText = () => {
        if (lhsValue !== null && rhsValue !== null) {
            return `${lhsValue} ${selectedOperator} ${rhsValue}`;
        } else if (lhsValue !== null) {
            return `${lhsValue} ${selectedOperator} RHS`;
        } else if (rhsValue !== null) {
            return `LHS ${selectedOperator} ${rhsValue}`;
        }
        return 'LHS value operator RHS value';
    };

    return (
        <div>
            <div className={styles['lhs-point-label']}>
                LHS
            </div>
            <div className={`${styles['nodeBox']} ${styles.gateOperator}`} style={{ maxWidth: "300px" }}>
                <Form name="gate-operator" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <GiLogicGateNand className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Conditional Node"}</h6>
                                    <span>{lhsType || rhsType ? `Type: ${lhsType || rhsType}` : "No Type Connected"}</span>
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
                                    placeholder="Select Operator"
                                    value={selectedOperator}
                                    onChange={handleOperatorChange}
                                >
                                    <Option value="Equal to">Equal to</Option>
                                    <Option value="Not equal to">Not equal to</Option>
                                    <Option value="Greater than">Greater than</Option>
                                    <Option value="Less than">Less than</Option>
                                    <Option value="Greater than or equal to">Greater than or equal to</Option>
                                    <Option value="Less than or equal to">Less than or equal to</Option>
                                </Select>
                            </Form.Item>
                            <span>{getDynamicText()}</span>
                        </div>

                        <div className={styles['rhs-point-label']}>
                            RHS
                        </div>

                        <Handle
                            type="target"
                            position={Position.Left}
                            id="target1"
                            className={styles.leftpoint}
                            isValidConnection={isValidConnection}
                        />
                        <Handle
                            type="target"
                            position={Position.Left}
                            id="target2"
                            className={styles.rightpoint}
                            isValidConnection={isValidConnection}
                        />
                        <Handle type="source" id="source1" position={Position.Right} />
                        <Handle type="source" id="source2" position={Position.Bottom} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ConditionalNode;
