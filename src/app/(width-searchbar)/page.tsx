import styles from "./page.module.css";
import ClientComponent from "../../components/client-component";
import ServerComponent from "../../components/server-components";
export default function Home() {
  return (
    <div className={styles.page}>
      <ClientComponent>
        <ServerComponent />
      </ClientComponent>
    </div>
  );
}
