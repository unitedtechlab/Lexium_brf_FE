import Image from "next/image";
import loginImg from "@/app/assets/images/authimg.svg";
import classes from "./content.module.css";

interface ContentProps {
  heading: string;
  description: string;
}

function Content({ heading, description }: ContentProps) {
  return (
    <div className={classes.loginSidebar}>
      <h3>{heading}</h3>
      <h5>{description}</h5>
      <div className={classes.loginAnimation}>
        <Image src={loginImg} alt="login-image animation" priority />
      </div>
    </div>
  );
}

export default Content;
