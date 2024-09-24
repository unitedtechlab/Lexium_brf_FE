import React, { useMemo } from 'react';
import Image from "next/image";
import Leftarrow from "../../assets/images/left-arrow.png";
import classes from "./breadcrumb.module.css";
import Link from "next/link";

interface Breadcrumb {
    href: string;
    label: string;
}

interface BreadCrumbProps {
    breadcrumbs: Breadcrumb[];
}

const BreadCrumb: React.FC<BreadCrumbProps> = ({ breadcrumbs }) => {
    const memoizedBreadcrumbs = useMemo(() => {
        return breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className={index === breadcrumbs.length - 1 ? classes.active : ""}>
                <Link href={breadcrumb.href}>
                    {index === 0 && <Image src={Leftarrow} alt="Left Arrow" width={24} height={24} />}
                    <p>{breadcrumb.label}</p>
                </Link>
            </li>
        ));
    }, [breadcrumbs]);

    return <ul className={classes.Breadcrumb}>{memoizedBreadcrumbs}</ul>;
};

export default BreadCrumb;
