/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Layout from "@uta/components/layout"
import { useRoom } from "@uta/hooks/useRoom"
import { Checkbox } from "@uta/shadcn/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uta/shadcn/components/ui/select"
import { api } from "@uta/utils/api"
export function Monitor() {
  const room = useRoom()
  const updateRoomSetting = api.rooms.updateRoomSetting.useMutation()

  return (
    <>
      <Layout title="Settings" description="Customize your favor">
        <form className="w-2/3 space-y-6 dark">
          <p>Preferred language</p>
  <Select onValueChange={
            (e) => {
                if(!room) return
                updateRoomSetting.mutate({
                  id: room.id,
                  data: {
                      ...room.config,
                      searchSuffix: e
                  }
                })
              }
            } defaultValue={
              room?.config?.searchSuffix ?? "auto"
            }
            
          >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
            <SelectContent className="dark">
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="0">
                <span>English</span>
              </SelectItem>
              <SelectItem value="1">
                <span>Japanese</span>
              </SelectItem>
              <SelectItem value="2">
                <span>Chinese</span>
              </SelectItem>
              <SelectItem value="3">
                <span>Korean</span>
              </SelectItem>
              <SelectItem value="4">
                <span>Thai</span>
              </SelectItem>
              </SelectContent>
            </Select>
            <p className="opacity-50 text-xs">
              If you want to display the song in a specific language, you can select it here.
              When select auto, the system will detect the language of the song and display the result in that language
          </p>
          <p>Search source</p>
          <Checkbox
            defaultChecked={
              room?.config?.allowSearchYoutube ?? true
            }
            onCheckedChange={
              (e) => {
                if (!room) return
                updateRoomSetting.mutate({
                  id: room.id,
                  data: {
                    ...room.config,
                    allowSearchYoutube: e
                  }
                })
              }
            }
          />
          <label
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Youtube
          </label>
          <br />
          <Checkbox
            defaultChecked={
              room?.config?.allowSearchNiconico ?? true
            }
            onCheckedChange={
              (e) => {
                if (!room) return
                updateRoomSetting.mutate({
                  id: room.id,
                  data: {
                    ...room.config,
                    allowSearchNiconico: e
                  }
                })
              }
            }
          />
          <label
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Niconico
          </label>
          <p className="opacity-50 text-xs -mt-8">
            Select the source you want to search for songs
          </p>
        </form>
      </Layout>
    </>
  )
}

export default Monitor