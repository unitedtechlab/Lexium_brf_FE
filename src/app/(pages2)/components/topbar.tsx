import React, { useState } from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { Button } from 'antd';
import Image from 'next/image';
import Logo from '@/app/assets/images/logo.png';
import Link from 'next/link';

const Topbar = ({ onSave, setOperationName, onFormat }: { onSave: () => void, setOperationName: (name: string) => void, onFormat: () => void }) => {
    const [isSaved, setIsSaved] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.value.trim();
        if (name === '') {
            setIsSaved(false);
        } else {
            setOperationName(name);
        }
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
                    <input
                        type="text"
                        placeholder='Operation Name'
                        onChange={handleInputChange}
                        readOnly={isSaved}
                    />
                </div>

                <div className={`flex gap-1 ${styles.rightButtons}`}>
                    <Button className='btn' onClick={onSave}>
                        Save
                    </Button>
                    <Link className="btn btn-outline" href="/dashboard">
                        Discard
                    </Link>
                    <Button className='btn btn-outline' onClick={onFormat}>
                        Format
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
