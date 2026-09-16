import * as github from '@actions/github'
import { setupClaCheck } from '../src/setupClaCheck'
import { lockPullRequest } from '../src/pullrequest/pullRequestLock'
import { run } from '../src/main'

jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('../src/pullrequest/pullRequestLock')
jest.mock('../src/setupClaCheck')
jest.mock('../src/subscription', () => ({ validateSubscription: jest.fn() }))
jest.mock('../src/shared/getInputs', () => ({
  ...jest.requireActual('../src/shared/getInputs'),
  lockPullRequestAfterMerge: jest.fn().mockReturnValue('true')
}))
const mockedSetupClaCheck = jest.mocked(setupClaCheck)
const mockedLockPullRequest = jest.mocked(lockPullRequest)


describe('Pull request event', () => {

  beforeEach(async () => {
      // @ts-ignore
      github.context = {
        eventName: 'pull_request',
        ref: 'refs/pull/232/merge',
        workflow: 'CLA Assistant',
        action: 'step-security/cla-assistant-github-action-action-1',
        actor: 'step-security',
        payload: {
          action: 'closed',
          number: '1',
          pull_request: {
            number: 1,
            title: 'test',
            user: {
              login: 'step-security'
            }
          },
          repository: {
            name: 'auto-assign',
            owner: {
              login: 'step-security'
            }
          }
        },
        repo: {
          owner: 'step-security',
          repo: 'auto-assign'
        },
        issue: {
          owner: 'kentaro-m',
          repo: 'auto-assign',
          number: 1
        },
        sha: ''
      }

    }
  )

  test('the lockPullRequest  method should be called if there is a pull request merge/closed', async () => {

    await run()
    expect(mockedLockPullRequest).toHaveBeenCalled()


  })

  test('the setupClaCheck method should not called if there is a pull request merge/closed', async () => {

    await run()
    expect(mockedSetupClaCheck).not.toHaveBeenCalled()
  })

  test('the lockPullRequest  method should not be called if there is a pull request opened', async () => {

    github.context.payload.action = 'opened'
    await run()

    expect(mockedLockPullRequest).not.toHaveBeenCalled()

  })

  test('the setupClaCheck  method should  be called if there is a pull request opened', async () => {

    github.context.payload.action = 'opened'
    await run()
    expect(mockedSetupClaCheck).toHaveBeenCalled()

  })

  test('the lockPullRequest  method should not be called if there is a pull request sync', async () => {

    github.context.payload.action = 'synchronize'

    await run()

    expect(mockedLockPullRequest).not.toHaveBeenCalled()

  })

  test('the setupClaCheck  method should  be called if there is a pull request sync', async () => {
    github.context.payload.action = 'synchronize'
    await run()
    expect(mockedSetupClaCheck).toHaveBeenCalled()

  })

})
