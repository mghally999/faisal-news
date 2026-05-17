import { Newspaper } from 'lucide-react';
import styles from './EmptyState.module.css';

export default function EmptyState({ title = 'Nothing here', description, icon, action }) {
  const IconComp = icon || Newspaper;
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <IconComp size={36} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.desc}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
