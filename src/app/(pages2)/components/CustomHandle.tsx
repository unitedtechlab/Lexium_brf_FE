import React, { useEffect, useState } from 'react';
import { Handle, useReactFlow, Position } from 'reactflow';

interface CustomHandleProps {
    nodeId: string; // Add nodeId to differentiate between nodes
    id: string;
    type: 'source' | 'target';
    position: Position;
    connectioncount: number;
    className?: string;
}

const CustomHandle: React.FC<CustomHandleProps> = (props) => {
    const { getEdges } = useReactFlow();
    const [connectionCount, setConnectionCount] = useState(0);

    const updateConnectionCount = () => {
        const edges = getEdges();
        const count = edges.filter(
            (edge) =>
            (props.type === 'target' ?
                edge.target === props.nodeId && edge.targetHandle === props.id :
                edge.source === props.nodeId && edge.sourceHandle === props.id
            )
        ).length;
        setConnectionCount(count);
    };

    useEffect(() => {
        updateConnectionCount();
        const interval = setInterval(updateConnectionCount, 100);

        return () => clearInterval(interval);
    }, [getEdges, props.nodeId, props.id]);

    return (
        <Handle
            {...props}
            className={props.className}
            isConnectable={connectionCount < props.connectioncount}
        />
    );
};

export default CustomHandle;
