import styles from "../styles/Home.module.css";
import { Button, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/sign-in");
  });

  return <div className={styles.container}></div>;
}
