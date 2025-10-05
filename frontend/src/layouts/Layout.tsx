

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="w-full ">{children}</div>
    </div>
  );
};

export default Layout;
