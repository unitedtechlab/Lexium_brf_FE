import React from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { Button } from 'antd';
import Image from 'next/image';
import Logo from '@/app/assets/images/logo.svg';
import { useReactFlow } from 'reactflow';

const Topbar = () => {
    const { getNodes, getEdges } = useReactFlow();

    const handleSave = () => {
        const nodes = getNodes();
        const edges = getEdges();

        const nodeData = nodes.map((node) => {
            const targetEdges = edges.filter((edge) => edge.target === node.id);
            const sources = targetEdges.map((edge) => edge.source);

            const sourceEdges = edges.filter((edge) => edge.source === node.id);
            const targets = sourceEdges.map((edge) => edge.target);

            const sourceValue = sources.length === 1 ? sources[0] : sources.length > 1 ? sources : '';
            const targetValue = targets.length === 1 ? targets[0] : targets.length > 1 ? targets : '';

            // Exclude 'label' and 'result' from node data
            const { label, result, ...filteredData } = node.data;

            return {
                id: node.id,
                type: node.type,
                data: filteredData, // Pass filtered data
                connectedEdges: [
                    {
                        source: sourceValue,
                        target: targetValue
                    }
                ]
            };
        });

        console.log(JSON.stringify(nodeData, null, 2));
    };

    return (
        <div className={styles.topbarWrapper}>
            <div className={`flex gap-1 ${styles.topbar}`}>
                <div className={`flex gap-1 ${styles.discardBtn}`}>
                    <Image src={Logo} alt='Logo' width={180} />
                </div>
                <div className={styles.workspaceName}>
                    <h6 style={{ margin: 0 }}>Arithmetic Operation</h6>
                </div>

                <div className={`flex gap-1 ${styles.rightButtons}`}>
                    <Button className='btn' onClick={handleSave}>
                        Save
                    </Button>
                    <Button className="btn btn-outline">
                        Discard
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
