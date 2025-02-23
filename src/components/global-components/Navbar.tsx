/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { IoSearchOutline } from 'react-icons/io5';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { basicGetApi } from '@/app/config/axios';
import { signIn, signOut } from '@/lib/redux/reducers/userSlice';
import { useEffect, useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Button } from '../ui/button';
import { IoMdClose } from 'react-icons/io';
import Link from 'next/link';
import { Input, Dropdown, DropdownMenu, DropdownTrigger, DropdownItem, Avatar } from '@nextui-org/react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import cookies from 'js-cookie';

export default function Navbar() {
  const path: string = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hide, setHide] = useState<boolean>(
    path === '/sign-up' ||
      path === '/sign-in' ||
      path === '/unauthorized' ||
      path === '/unauthenticated' ||
      path === '/forgot-password' ||
      path.startsWith('/recover-password') ||
      path.startsWith('/verify-email') ||
      path.startsWith('/creator')
      ? true
      : false
  );
  useEffect(() => {
    setHide(
      path === '/sign-up' ||
        path === '/sign-in' ||
        path === '/unauthorized' ||
        path === '/unauthenticated' ||
        path === '/forgot-password' ||
        path.startsWith('/recover-password') ||
        path.startsWith('/verify-email') ||
        path.startsWith('/creator')
        ? true
        : false
    );
  }, [path]);

  const route = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };
  const closeNavbar = () => {
    setIsOpen(false);
  };

  const dispatch = useAppDispatch();
  const keepLogin = async () => {
    try {
      const token = localStorage.getItem('tkn') || sessionStorage.getItem('tkn');
      const response = await basicGetApi.get('/users/keep-login', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      document.cookie = `tkn=${response.data.result.token}; path=/;`;
      if (response.data.result.role === 'organizer') {
        document.cookie = `org=${response.data.result.token}r2org; path=/;`;
      }
      dispatch(signIn({ ...response.data.result, isAuth: true }));
      localStorage.setItem('tkn', response.data.result.newToken);
    } catch (error) {
      console.log(error);
    }
  };

  const user = useAppSelector((state) => state.userReducer);

  const logOut = () => {
    dispatch(signOut());
    cookies.remove('tkn');
    cookies.remove('org');
    localStorage.removeItem('tkn');
    sessionStorage.removeItem('tkn');
    route.refresh();
  };

  useEffect(() => {
    keepLogin();
  }, []);

  const [searchKeyword, setSearchKeyword] = useState('');
  const onHandleSearch = (e: any) => {
    e.preventDefault();
    route.push(`/search?keyword=${searchKeyword}`);
  };

  return (
    <>
      <div className={`${hide ? 'hidden' : 'block'} sticky top-0 z-20 bg-white bg-opacity-70 shadow-sm backdrop-blur-xl backdrop-filter`}>
        <nav className="flex w-full flex-col justify-between py-3 shadow-sm px-10 md:px-32 lg:px-48 lg:py-6">
          {/**Div dibawah adalah pemisah antara content utama dengan phone menu Modelnya flex-col supaya phone menu bisa turun kebawah
           * Div content mewakili konten navbar
           * Div phone menu mewakili menu handphone
           */}

          <div className="content flex items-center justify-between">
            <div className="flex gap-2">
              <div className="hamburger-wrapper flex flex-collg:hidden">
                <div className="hamburger inline-flex lg:hidden">
                  <Button onClick={toggleNavbar} aria-label="Menu" className="py-0 px-1 bg-transparent">
                    {!isOpen ? <GiHamburgerMenu color="black" /> : <IoMdClose color="black" />}
                  </Button>
                </div>
              </div>
              <div className="logo flex cursor-pointer items-center justify-between gap-10">
                <h1 className="logo-text text-xl font-bold">
                  <Link href="/" onClick={closeNavbar}>
                    Event
                  </Link>
                </h1>
                <div className="hidden lg:inline border-none">
                  <form onSubmit={onHandleSearch}>
                    <Input placeholder="Search event here.." startContent={<IoSearchOutline />} type="text" name="search" value={searchKeyword} className="border-none" onChange={(e) => setSearchKeyword(e.target.value)} />
                  </form>
                </div>
                {/* <div className="hidden lg:inline">
                  {city ? (
                    <Select
                      className="w-full h-full z-50"
                      items={city}
                      aria-label="City"
                    >
                      {(city) => (
                        <SelectItem key={city.key} className="w-full">
                          {city.label}
                        </SelectItem>
                      )}
                    </Select>
                  ) : (
                    <Select>
                      <SelectItem>Select a city</SelectItem>
                    </Select>
                  )}
                </div> */}
              </div>
            </div>
            <div className="menu hidden md:gap-3 lg:flex">
              <ul className="flex gap-10">
                <li className="cursor-pointer hover:font-semibold">
                  <Link href="/#pricing">About</Link>
                </li>
                <li className="cursor-pointer hover:font-semibold">
                  <Link href="/page/resource/">Resource</Link>
                </li>
                <li className="cursor-pointer hover:font-semibold">
                  <Link href="/page/about-us/">Contact Us</Link>
                </li>
              </ul>
            </div>

            {user.name ? (
              <div className="flex gap-5">
                <Link href={`/search`}>
                  <Button variant={'secondary'}>Explore Event</Button>
                </Link>
                <Avatar isBordered as="button" className="transition-transform lg:hidden" color="secondary" name="Jason Hughes" size="sm" src={`${user?.pfp_url}`} />
                <div className="hidden lg:inline">
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Avatar isBordered as="button" className="transition-transform" color="secondary" name="Jason Hughes" size="sm" src={`${user?.pfp_url}`} />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Profile Actions" variant="flat" className="bg-white rounded-lg p-3">
                      <DropdownItem key="profile" className="h-14 gap-2">
                        <p className="font-semibold">{user.name}</p>
                        <p className="font-semibold">{user.email}</p>
                      </DropdownItem>

                      <DropdownItem key="settings">
                        <Link href={'/setting/profile'}>Settings</Link>
                      </DropdownItem>
                      <DropdownItem key="dashboard">
                        <Link href={'/creator/dashboard'}>Dashboard</Link>
                      </DropdownItem>

                      <DropdownItem key="help_and_feedback">
                        <Button type="button" className="border bg-white text-black hover:bg-gray-200 w-full" onClick={() => route.push('/sign-in')}>
                          Switch Account
                        </Button>
                      </DropdownItem>
                      <DropdownItem key="logout" color="danger">
                        <Button type="button" className="bg-red-700 hover:bg-red-800 w-full" onClick={logOut}>
                          Log out
                        </Button>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            ) : (
              <div className="cta hidden lg:flex gap-2">
                <Link href={`/search`}>
                  <Button variant={'secondary'}>Explore Event</Button>
                </Link>
                <Link href={`/sign-in`}>
                  <Button>Login</Button>
                </Link>
                <Link href={`/sign-up`}>
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            <div className="cta hidden">
              <Link href={`https://cal.com/satrio-langlang-vlenyy/introductorycall`}>
                <Button>Login</Button>
              </Link>
              <Link href={`https://cal.com/satrio-langlang-vlenyy/introductorycall`}>
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
          {/**Div dibawah adalah menu untuk handphone */}
          <div className={`phone-menu transition-all duration-300 ease-in-out ese ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            {isOpen && (
              <div className="menuphone my-3 flex flex-col py-2 lg:hidden h-screen">
                {user.name ? (
                  <div className="flex flex-col gap-4 items-start py-5">
                    <div className="flex justify-between gap-3">
                      <Avatar isBordered as="button" className="transition-transform h-10 w-10" color="secondary" name="Jason Hughes" size="sm" src={`${user?.pfp_url}`} />
                      <div className="flex flex-col">
                        <h1 className="text-sm font-bold">Hello {user.name}!</h1>
                        <h1 className="text-xs">{user.email}</h1>
                      </div>
                    </div>
                    <li className="my-2 list-none">
                      <Link href="/creator/dashboard" onClick={closeNavbar} className="font-semibold">
                        Dashboard
                      </Link>
                    </li>
                    <li className="my-2 list-none">
                      <Link
                        href="/search"
                        onClick={() => {
                          route.push(`/search`);
                        }}
                        className="font-semibold"
                      >
                        Explore
                      </Link>
                    </li>
                    <li className="my-2 list-none">
                      <Link href="/setting/profile" onClick={closeNavbar} className="font-semibold">
                        Setting
                      </Link>
                    </li>
                    <li className="my-2 list-none">
                      <Link href="#" onClick={logOut} className="font-semibold">
                        Log Out
                      </Link>
                    </li>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center py-5">
                    <li className="my-2 list-none">
                      <Link
                        href="/page/about-us/"
                        onClick={() => {
                          route.push(`/search`);
                        }}
                        className="font-semibold"
                      >
                        Explore
                      </Link>
                    </li>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
