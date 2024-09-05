import Layout from "@uta/components/layout"
import { Card } from "@uta/shadcn/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@uta/shadcn/components/ui/dropdown-menu"
import { RxMinusCircled } from "react-icons/rx"

export function Users() {
  return (
    <>
      <Layout title="Users" description="All user are temporary">
        <div className="mt-8">
          <div className="dark">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="mt-4">
                  <Card>
                    <div className="flex border-b py-3 cursor-pointer hover:shadow-md px-2 ">
                      <img className='w-10 h-10 object-cover rounded-lg' alt='User avatar' src='https://images.unsplash.com/photo-1477118476589-bff2c5c4cfbb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=200&q=200' />
                      <div className="flex flex-col px-2 w-full">
                        <span className="text-sm text-purple-400 font-semibold pt-1">
                          starchaser
                        </span>
                        <span className="text-xs text-slate-400  uppercase font-medium">
                          Joined 2 hours ago
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 dark">
                <DropdownMenuLabel>starchaser</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <RxMinusCircled /> <span className="ml-2 text-red-500">Kick</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Layout>
      </>
  )
}

export default Users