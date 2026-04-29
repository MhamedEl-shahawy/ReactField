import * as HoverCard from '@radix-ui/react-hover-card'
import { Resource } from '@/components/Resource'

const core = [
  {
    name: 'Mohamed Elshahawy',
    description: 'ReactField Maintainer',
    socials: {
      github: 'https://github.com/MhamedEl-shahawy',
      linkedin: 'https://www.linkedin.com/in/mohamed-elshahawy-6a74a112a/?skipRedirect=true',
      site: 'https://github.com/MhamedEl-shahawy',
    },
    image: '/mohamed-elshahawy.png',
  },
]

export function Contributors() {
  return (
    <div className="my-6">
      <div className="my-16">
        <div>
          <span className="block mb-6 text-xs font-semibold tracking-wide uppercase text-zinc-900 dark:text-white">
            Maintainer
          </span>
        </div>
        <div className="flex -space-x-2 overflow-hidden not-prose isolate">
          {core.map((person) => (
            <MemberCard key={person.image} person={person} large />
          ))}
        </div>
      </div>

      <p className="lead">
        ReactField is maintained by{' '}
        <Resource url="/team/mohamed-elshahawy">Mohamed Elshahawy</Resource> and
        supported by community contributions. If you want to help improve the
        content or site experience, join our{' '}
        <Resource url="https://github.com/MhamedEl-shahawy/ReactField">
          contributors on GitHub
        </Resource>
        .
      </p>
    </div>
  )
}

function MemberCard({ person, large = false }) {
  const { description, image, name, socials } = person

  const size = large ? `w-16 h-16` : `w-8 h-8`

  return (
    <HoverCard.Root key={image}>
      <HoverCard.Trigger asChild>
        <div>
          <Resource
            className="inline-block rounded-full outline-none cursor-pointer"
            url={socials.site}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={image}
              className={`${size} relative z-10 inline-block rounded-full ring-2 ring-white dark:ring-zinc-900`}
              src={image}
              alt=""
            />
          </Resource>
        </div>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className="data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade z-40 w-[300px] rounded-md bg-white p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:transition-all"
          sideOffset={5}
        >
          <div className="flex flex-col gap-[7px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="block h-[60px] w-[60px] rounded-full"
              src={image}
              alt=""
            />
            <div className="flex flex-col gap-[15px]">
              <div>
                <div className="m-0 font-medium leading-[1.5]">{name}</div>
              </div>
              <div className="m-0 text-sm leading-[1.5]">{description}</div>
              <div className="prose flex gap-[15px]">
                {socials.twitter && (
                  <>
                    <Resource
                      url={socials.twitter}
                      className="m-0 text-sm leading-[1.5]"
                    >
                      Twitter
                    </Resource>
                  </>
                )}
                {socials.linkedin && (
                  <>
                    <Resource
                      url={socials.linkedin}
                      className="m-0 text-sm leading-[1.5]"
                    >
                      Linkedin
                    </Resource>
                  </>
                )}
                {socials.github && (
                  <>
                    <Resource
                      url={socials.github}
                      className="m-0 text-sm leading-[1.5]"
                    >
                      GitHub
                    </Resource>
                  </>
                )}
              </div>
            </div>
          </div>
          <HoverCard.Arrow className="fill-white" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
