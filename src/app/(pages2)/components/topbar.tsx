import React from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { Button, message } from 'antd';
import Image from 'next/image';
import Logo from '@/app/assets/images/logo.png';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReactFlow } from 'reactflow';

const Topbar = ({ onSave }: { onSave: () => void }) => {
    const pathname = usePathname();
    const { getNodes } = useReactFlow();

    const saveAsGlobalVariable = () => {
        const outputNodes = getNodes().filter((node) => node.type === 'end_node' && node.data?.outputName);

        if (outputNodes.length === 0) {
            message.error('No valid output node found with an output name.');
            return;
        }

        // Fetch existing global variables from localStorage
        const globalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');

        outputNodes.forEach((node) => {
            const existingVariableIndex = globalVariables.findIndex(
                (variable: any) => variable.outputName === node.data.outputName
            );

            const newGlobalVariable = {
                outputName: node.data.outputName,
            };

            if (existingVariableIndex !== -1) {
                // If variable exists, overwrite it
                globalVariables[existingVariableIndex] = newGlobalVariable;
                message.success(`Global variable "${node.data.outputName}" updated successfully.`);
            } else {
                // If variable does not exist, create a new one
                globalVariables.push(newGlobalVariable);
                message.success(`Global variable "${node.data.outputName}" saved successfully.`);
            }
        });

        // Save updated global variables to localStorage
        localStorage.setItem('GlobalVariables', JSON.stringify(globalVariables));

        // Dispatch a custom event to notify other parts of the application (if needed)
        const event = new Event('globalVariableUpdated');
        window.dispatchEvent(event);
    };

    return (
        <div className={styles.topbarWrapper}>
            <div className={`flex gap-1 ${styles.topbar}`}>
                <div className={`flex gap-1 ${styles.logoTopbar}`}>
                    <Link href="/dashboard">
                        <Image src={Logo} alt='Logo' width={200} />
                    </Link>
                </div>
                <div className={styles.workspaceName}>
                    <h6 style={{ margin: 0 }}>
                        {pathname === '/conditional' && <>Conditional Operation</>}
                        {pathname === '/arithmetic' && <>Arithmetic Operation</>}
                    </h6>
                </div>

                <div className={`flex gap-1 ${styles.rightButtons}`}>
                    <Button className='btn' onClick={saveAsGlobalVariable}>
                        Save as a Global Variable
                    </Button>
                    <Button className='btn' onClick={onSave}>
                        Save
                    </Button>
                    <Link className="btn btn-outline" href="/dashboard">
                        Discard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
