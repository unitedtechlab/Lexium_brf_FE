import React from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { Button } from 'antd';
import Image from 'next/image';
import Logo from '@/app/assets/images/logo.png';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Topbar = ({ onSave }: { onSave: () => void }) => {
    const pathname = usePathname();

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
                        {pathname === '/conditional' && (
                            <>Conditional Operation</>
                        )}
                        {pathname === '/arithmetic' && (
                            <>Arithmetic Operation</>
                        )}
                    </h6>
                </div>

                <div className={`flex gap-1 ${styles.rightButtons}`}>
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
