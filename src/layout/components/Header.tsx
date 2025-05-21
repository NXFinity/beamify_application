import React from "react";
import Link from "next/link";
import UserNavigation from "@/layout/common/navigation/UserNavigation";
import HeaderNavigation from "@/layout/common/navigation/HeaderNavigation";
import Image from "next/image";
import { useAuth } from "@/core/auth/AuthProvider";
import GamifyCard from "@/theme/components/GamifyCard";
import { AdminService } from "@/core/api/admin/admin.service";
import { Gamify } from "@/core/api/admin/types/admin.interface";
import ShopBasket from "@/layout/common/basket/ShopBasket";
import ShopWishlist from "@/layout/common/wishlist/ShopWishlist";

const Header: React.FC = () => {
  const { user } = useAuth();
  const [gamify, setGamify] = React.useState<Gamify | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user && user._id) {
      setLoading(true);
      AdminService.getAllGamify()
        .then((profiles: Gamify[]) => {
          const found = profiles.find((g) => {
            if (typeof g.user === 'object' && g.user && '_id' in g.user) {
              return (g.user as { _id: string })._id === user._id;
            }
            return g.user === user._id;
          });
          setGamify(found || null);
        })
        .finally(() => setLoading(false));
    } else {
      setGamify(null);
    }
  }, [user]);

  return (
    <header className="MainHeader sticky top-0 w-full bg-gray-900 shadow-sm z-50">
      <div className="flex items-center h-16 px-6 justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/images/logo/icon_w.svg" alt="Beamify Logo" width={32} height={32} className="h-8 w-8 drop-shadow-xl" priority />
            <span className="font-bold text-xl text-[#ff3c00] group-hover:text-white transition">Beamify</span>
          </Link>
          <HeaderNavigation />
        </div>
        <div className="flex items-center ml-auto gap-4">
          {user && !loading && gamify && (
            <GamifyCard gamify={{
              points: gamify.points,
              level: gamify.level,
              exp: gamify.exp,
              crystals: gamify.crystals
            }} />
          )}
          {user && loading && (
            <div className="px-4 py-2 text-gray-400">Loading gamify...</div>
          )}
          {user && (
            <>
              <ShopWishlist />
              <ShopBasket />
            </>
          )}
          <UserNavigation />
        </div>
      </div>
    </header>
  );
};

export default Header;
