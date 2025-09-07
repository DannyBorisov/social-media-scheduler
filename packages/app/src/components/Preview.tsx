import styles from './Preview.module.css';

interface Props {
  provider: 'facebook' | 'instagram' | 'linkedin';
}
const Preview: React.FC<Props> = (props) => {
  if (props.provider === 'facebook') {
    return <div></div>;
  }

  return <></>;
};

export default Preview;
