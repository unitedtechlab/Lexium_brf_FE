import React, { useState } from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { Button, message } from 'antd';
import Image from 'next/image';
import Logo from '@/app/assets/images/logo.svg'
import Link from 'next/link';


const Topbar = () => {

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
                    <Link href="/"
                        className='btn'
                    >
                        Save
                    </Link>
                    <Link href="/dashboard"
                        className='btn btn-outline'
                    >
                        Discard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
