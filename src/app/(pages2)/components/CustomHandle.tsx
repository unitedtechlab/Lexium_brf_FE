// CustomHandle.tsx
import React, { useEffect, useState } from 'react';
import { Handle, useReactFlow, Position } from 'reactflow';

interface CustomHandleProps {
    id: string;
    type: 'source' | 'target';
    position: Position;
    connectionCount: number;
    className?: string;
}

const CustomHandle: React.FC<CustomHandleProps> = (props) => {
    const { getEdges } = useReactFlow();
    const [connectionCount, setConnectionCount] = useState(0);

    const updateConnectionCount = () => {
        const edges = getEdges();
        const count = edges.filter(
            (edge) => edge.targetHandle === props.id || edge.sourceHandle === props.id
        ).length;
        setConnectionCount(count);
    };

    useEffect(() => {
        updateConnectionCount();
        const interval = setInterval(updateConnectionCount, 100);

        return () => clearInterval(interval);
    }, [getEdges, props.id]);

    return (
        <Handle
            {...props}
            className={props.className}
            isConnectable={connectionCount < props.connectionCount}
        />
    );
};

export default CustomHandle;
