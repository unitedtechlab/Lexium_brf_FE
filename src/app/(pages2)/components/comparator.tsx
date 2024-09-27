import React, { useState, useEffect } from 'react';
import { NodeProps, useReactFlow, Position, Handle, Edge } from 'reactflow';
import { Form, Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { GiLogicGateNand } from 'react-icons/gi';
import { BsThreeDots } from 'react-icons/bs';
import CustomHandle from './CustomHandle';

const { Option } = Select;

const ConditionalNode: React.FC<NodeProps<any>> = ({ id, data }) => {
    const { getEdges, getNode, setEdges, setNodes } = useReactFlow();
    const [selectedOperator, setSelectedOperator] = useState(data.gateOperator);
    const [lhsType, setLhsType] = useState<string | null>(null);
    const [rhsType, setRhsType] = useState<string | null>(null);
    const [lhsValue, setLhsValue] = useState<string | null>(null);
    const [rhsValue, setRhsValue] = useState<string | null>(null);
    const [expression, setExpression] = useState<string>('LHS value operator RHS value');

    const updateConnections = () => {
        const edges = getEdges();
        const lhsConnection = edges.find((edge: Edge) => edge.target === id && edge.targetHandle === 'target1');
        const rhsConnection = edges.find((edge: Edge) => edge.target === id && edge.targetHandle === 'target2');

        if (lhsConnection) {
            const connectedNode = getNode(lhsConnection.source);
            if (connectedNode && connectedNode.data) {
                setLhsValue(connectedNode.data.value || connectedNode.data.variables || 'LHS');
                setLhsType(connectedNode.data.variableType || 'Unknown Type');
            }
        } else {
            setLhsValue(null);
            setLhsType(null);
        }

        if (rhsConnection) {
            const connectedNode = getNode(rhsConnection.source);
            if (connectedNode && connectedNode.data) {
                setRhsValue(connectedNode.data.value || connectedNode.data.variables || 'RHS');
                setRhsType(connectedNode.data.variableType || 'Unknown Type');
            }
        } else {
            setRhsValue(null);
            setRhsType(null);
        }
    };

    useEffect(() => {
        updateConnections();
        const interval = setInterval(updateConnections, 100);

        return () => clearInterval(interval);
    }, [getEdges, getNode, id]);

    useEffect(() => {
        if (lhsValue && rhsValue) {
            setExpression(`${lhsValue} ${selectedOperator} ${rhsValue}`);
        } else {
            setExpression('LHS value operator RHS value');
        }
    }, [lhsValue, rhsValue, selectedOperator]);

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
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        message.success('Node deleted successfully');
    };

    const menuItems = [
        { label: 'Delete Node', key: '0', onClick: handleDeleteNode },
    ];

    return (
        <div>
            <div className={styles['lhs-point-label']}>LHS</div>
            <div className={`${styles['nodeBox']} ${styles.gateOperator}`} style={{ maxWidth: '300px' }}>
                <Form name={`compare-form-${id}`} layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <GiLogicGateNand className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || 'Conditional Node'}</h6>
                                    <span>{`LHS Type: ${lhsType || 'No Type'}`} | {`RHS Type: ${rhsType || 'No Type'}`}</span>
                                </div>
                            </div>
                            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                                <a onClick={(e) => e.preventDefault()} className="iconFont">
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
                            <span>{expression}</span>
                        </div>
                        <div className={styles['rhs-point-label']}>RHS</div>

                        <CustomHandle
                            nodeId={id}
                            id="target1"
                            type="target"
                            position={Position.Left}
                            connectioncount={1}
                            className={styles.leftpoint1}
                        />

                        <CustomHandle
                            nodeId={id}
                            type="target"
                            position={Position.Left}
                            id="target2"
                            connectioncount={1}
                            className={styles.leftpoint2}
                        />

                        <Handle type="source" id="source" position={Position.Right} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ConditionalNode;
