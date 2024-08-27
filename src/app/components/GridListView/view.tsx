import classes from './view.module.css';
import { Button } from "antd";
import { FaThList, FaTh } from "react-icons/fa";

export default function GridListView() {
    return (
        <div className={classes.viewWrapper}>
            <div className={`${classes.viewList} flex`}>
                <Button className={classes.viewBtn}>
                    <FaThList />
                </Button>
                <Button className={classes.viewBtn}>
                    <FaTh />
                </Button>
            </div>
        </div>
    );
}
