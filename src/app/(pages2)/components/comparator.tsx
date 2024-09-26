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
    const { getEdges, setEdges, setNodes } = useReactFlow();
    const [selectedOperator, setSelectedOperator] = useState(data.gateOperator || 'Equal to');

    useEffect(() => {
        const updateConnections = () => {
            const edges = getEdges();
            const lhsConnections = edges.filter(
                (edge: Edge) => edge.target === id && edge.targetHandle === 'target1'
            );
            const rhsConnections = edges.filter(
                (edge: Edge) => edge.target === id && edge.targetHandle === 'target2'
            );
            console.log(`LHS Connections: ${lhsConnections.length}, RHS Connections: ${rhsConnections.length}`);
        };

        updateConnections();
    }, [getEdges, id]);

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
                <Form name="gate-operator" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <GiLogicGateNand className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || 'Conditional Node'}</h6>
                                    <span>{'No Type Connected'}</span>
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
                            <span>LHS value operator RHS value</span>
                        </div>

                        <div className={styles['rhs-point-label']}>RHS</div>

                        <CustomHandle
                            id="target1"
                            type="target"
                            position={Position.Left}
                            connectionCount={1}
                            className={styles.toppoint1}
                        />

                        <CustomHandle
                            type="target"
                            position={Position.Left}
                            id="target2"
                            connectionCount={1}
                            className={styles.toppoint2}
                        />
                        <Handle type="source" id="if_source" position={Position.Right} />
                        <Handle type="source" id="else_source" position={Position.Bottom} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ConditionalNode;
