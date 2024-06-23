import { FC } from 'react'

const ErrorPage: FC = () => {
  return (
    <div
      className={[
        //
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'fixed',
        'inset-0',
        'gap-4',
      ].join(' ')}
    >
      <div className={'text-8xl'}>😤</div>
      <div className={'text-5xl'}>Encountered an error</div>
      <div>
        <a href={'javascript:history.back()'}>Go back</a>
      </div>
    </div>
  )
}

export default ErrorPage
