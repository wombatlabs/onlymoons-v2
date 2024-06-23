import { type FC, useState } from 'react'
import { Root, Trigger, Content, NavItems, NavItem, Overlay } from './styles'
import { Link } from 'react-router-dom'
import { Brand } from '../Brand'
import { useLocale } from '../../state/stores'
import { StyledLink } from '../StyledLink'
import { StyledAnchor } from '../StyledAnchor'
import { FaBars } from 'react-icons/fa6'

export const NavMenu: FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false)
  const { getString: s } = useLocale()

  return (
    <Root>
      <Trigger onClick={() => setExpanded(!expanded)}>
        <FaBars />
      </Trigger>
      <Overlay $expanded={expanded} onClick={() => setExpanded(false)} />
      <Content $expanded={expanded}>
        <div className={'flex flex-row items-center gap-1'}>
          <Trigger onClick={() => setExpanded(!expanded)}>
            <FaBars />
          </Trigger>
          <Link to={'/'} className={'flex items-center'} onClick={() => setExpanded(false)}>
            <Brand />
          </Link>
        </div>
        <NavItems>
          {/*<NavItem $as={StyledLink} to={'/swap'} onClick={() => setExpanded(false)}>*/}
          {/*  {s('Swap')}*/}
          {/*</NavItem>*/}
          <NavItem $as={StyledLink} to={'/locker'} onClick={() => setExpanded(false)}>
            {s('Locker')}
          </NavItem>
          {/*<NavItem $as={StyledLink} to={'/advertising'}>*/}
          {/*  {s('Advertising')}*/}
          {/*</NavItem>*/}
          {/*<NavItem $as={StyledLink} to={'/caller'}>*/}
          {/*  {s('Caller')}*/}
          {/*</NavItem>*/}
          <NavItem
            $as={StyledAnchor}
            href={'https://onlymoons.gitbook.io/'}
            target={'_blank'}
            rel={'noreferrer noopener'}
            onClick={() => setExpanded(false)}
          >
            {s('Documentation')}
          </NavItem>
        </NavItems>
      </Content>
    </Root>
  )
}
