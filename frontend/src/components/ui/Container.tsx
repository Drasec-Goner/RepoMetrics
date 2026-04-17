interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => {
  return (
    <div className="max-w-6xl mx-auto px-6">
      {children}
    </div>
  );
};

export default Container;