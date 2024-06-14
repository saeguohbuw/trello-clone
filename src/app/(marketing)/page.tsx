import { Medal } from "lucide-react";
import { Button } from "@/src/components/shadcn-ui/button";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { cn } from "@/src/lib/utils";

const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const MarketingPage = () => {
  return (
    <div className={"flex flex-col items-center justify-center"}>
      <div
        className={cn(
          "flex flex-col items-center justify-center font-bold",
          poppinsFont.className,
        )}
      >
        <h1
          className={"mb-6 text-center text-3xl text-neutral-800 md:text-6xl"}
        >
          Task Mane helps you move your projects
        </h1>
        <div
          className={
            "w-fit rounded-md bg-gradient-to-r from-red-600 to-green-600 p-2 px-4 pb-4 text-3xl text-white md:text-6xl"
          }
        >
          FORWARD
        </div>
      </div>
      <div
        className={
          "mt-20 max-w-sm text-center text-sm text-neutral-700 md:max-w-2xl md:text-xl"
        }
      >
        Our website is designed to help streamline collaboration and organization
        among team members. With our easy-to-use platform, you can create tasks, assign them to team members and track progress 
        all in one place.
      </div>
      <Button className={"mt-16"} size={"xl"} style={{ fontSize: "20px" }} asChild>
        <Link href={"/sign-up"}>Get started with Task Mane</Link>
      </Button>
    </div>
  );
};

export default MarketingPage;
