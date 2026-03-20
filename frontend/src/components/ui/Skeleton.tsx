interface Props {
  className?: string;
}

const Skeleton = ({ className = "" }: Props) => {
  return (
    <div
      className={`animate-pulse bg-slate-700 rounded-lg ${className}`}
    />
  );
};

export default Skeleton;