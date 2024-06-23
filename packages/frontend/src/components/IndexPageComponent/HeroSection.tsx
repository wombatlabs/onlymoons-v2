import LogoImgSrc from '../../assets/logo-white.svg'
import { useLocale } from '../../state/stores'
import { SiCodeberg, SiDiscord, SiTelegram } from 'react-icons/si'
import { StyledTooltip } from '../StyledTooltip'
import tw from 'tailwind-styled-components'

const SocialLink = tw.a`
  inline-block
  rounded-full
  bg-primary-100
  dark:bg-primary-900
  transition-all
  hover:scale-110
  flex
  justify-center
  items-center
  w-12
  h-12
`

SocialLink.defaultProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
}

export default function HeroSection() {
  const { getString: s } = useLocale()

  return (
    <section className={'p-4 md:pt-20 grid md:grid-cols-2 items-center w-full max-w-screen-lg mx-auto overflow-hidden'}>
      {/*<ShimmerGroup />*/}
      <div className={'p-4 lg:p-8 py-12 lg:py-12'}>
        <div className={'flex flex-col gap-3'}>
          <div>
            <div className={'text-5xl font-extrabold text-secondary-500'}>{s`Open source`}</div>
            <div className={'text-4xl'}>{s`EVM utilities.`}</div>
          </div>
          <div className={'flex flex-row gap-3 items-center'}>
            <StyledTooltip
              trigger={
                <SocialLink href={'https://t.me/OnlyMoonsTeam'}>
                  <SiTelegram size={30} />
                </SocialLink>
              }
            >
              Telegram
            </StyledTooltip>
            <StyledTooltip
              trigger={
                <SocialLink href={'https://discord.gg/E8hXdpKenM'}>
                  <SiDiscord size={30} />
                </SocialLink>
              }
            >
              Discord
            </StyledTooltip>
            {/*<StyledTooltip*/}
            {/*  trigger={*/}
            {/*    <SocialLink href={'https://twitter.com/OnlyMoonsTeam'}>*/}
            {/*      <SiX size={20} />*/}
            {/*    </SocialLink>*/}
            {/*  }*/}
            {/*>*/}
            {/*  X/Twitter*/}
            {/*</StyledTooltip>*/}
            <StyledTooltip
              trigger={
                <SocialLink href={'https://codeberg.org/onlymoons-io/onlymoons-v2'}>
                  <SiCodeberg size={30} />
                </SocialLink>
              }
            >
              Codeberg
            </StyledTooltip>
          </div>
        </div>
      </div>
      <div className={'flex justify-center items-center -mt-64 translate-y-64'}>
        <div
          className={
            'w-96 h-96 bg-primary-400 dark:bg-primary-600 text-black rounded-full flex items-center justify-center transition-all duration-500 hover:-translate-y-4 overflow-hidden'
          }
        >
          <img
            className={'scale-[1.75] dark:opacity-75 dark:hover:opacity-100 transition-opacity'}
            src={LogoImgSrc}
            alt={s`OnlyMoons Logo`}
          />
        </div>
      </div>
    </section>
  )
}
