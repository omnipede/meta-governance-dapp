import React from 'react'
import { Button, Progress, Input } from 'antd'
import './style/style.css'
import { testData } from './test/testData'
import { ProposalForm } from './ProposalForm'
import * as util from '../util'


class Voting extends React.Component {
    data = {
      ballotBasicOriginData: [],
      ballotMemberOriginData: [],
      ballotBasicOriginItems: [],
      activeItems: [],
      proposalItems: [],
      finalizedItems: [],
      ballotCnt: 0,
    }
    state = {
      isBallotLoading: false,
      isBallotDetailLoading: false,
      // for test
      newProposal: false
    }

    constructor (props) {
      super(props)
      this.onClickDetail = this.onClickDetail.bind(this)
      this.onClickVote = this.onClickVote.bind(this)
    }

    async componentWillMount () {
      this.data.ballotCnt = await this.props.contracts.gov.getBallotLength()
      this.getBallotOriginItem()
    }

    async getBallotOriginItem () {
      let list = []
      // Use origin data in contract
      if (!this.data.ballotCnt) return;
      for (var i=1; i<=this.data.ballotCnt; i++) {
        await this.props.contracts.ballotStorage.getBallotBasic(i).then(
          ret => this.data.ballotBasicOriginData=[...this.data.ballotBasicOriginData, ret]
        )
      }

      if(!this.data.ballotBasicOriginData) return

      this.data.ballotBasicOriginData.map(item => {
        list.push(
          <div className='ballotDiv' state={item.state} key={list.length}>
            <div className='ballotInfoDiv'>
              <div className='ballotDetailDiv' style={{ width: '15%' }}>
                <h4>Creator</h4><p>METADIUM_EXAM
                </p>
              </div>
              <div className='ballotDetailDiv' style={{ width: '15%' }}>
                <h4>Ballot Type</h4><p>{item.ballotType}</p>
              </div>
              <div className='ballotDetailDiv'>
                <h4>Proposal Address</h4><p>{item.creator}</p>
              </div>
              <div className='ballotDetailDiv' style={{ width: '10%' }}>
                <h4>State</h4><p>{item.state}</p>
              </div>
              {item.state === 1 || item.state === 3 || item.state === 4
                // Ready, Accepted, Rejected
                ? <Button type='primary' id='ballotDetailBtn' onClick={this.onClickDetail}>+</Button> : ''}
            </div>
            <div className='voteDiv'>
              <Button id='noVotingBtn' onClick={() => this.onClickVote('N')} >No</Button>
              <Button id='yesVotingBtn' onClick={() => this.onClickVote('Y')} >Yes</Button>
              <span>
                <h4 style={{ float: 'left' }}>30%</h4>
                <h4 style={{ float: 'right' }}>70%</h4>
                <Progress percent={30} showInfo={false} />
              </span>
            </div>
            <div className='ballotExplainDiv'>
              { item.state === 2
                //InProgress
                ? <div style={{ float: 'right' }}>
                  <p >Started: {item.startTime}</p>
                  <p >Ended: {item.endTime}</p>
                </div> : ''}
              { item.state === 1
                ? <div style={{ float: 'right' }}>
                  <p >Duration: {item.duration}days</p>
                  <Button type='primary'>Change</Button>
                </div> : ''}
              <p>description</p>
              <p>description</p>
              <p>description</p>
              <div>
                <p>{util.convertHexToString(item.memo)}</p>
                { item.state === 1
                  ? <Button style={{ float: 'right' }} type='primary'>Revoke</Button> : ''}
              </div>
            </div>
          </div>
        )
      })

      this.data.ballotBasicOriginItems = list
      this.getBallotDetailInfo()
      this.setState({ isBallotLoading: true })
    }

    getBallotDetailInfo () {
      let activeList = []; let proposalList = []; let finalizedList = []

      this.data.ballotBasicOriginItems.map(item => {
        console.log(item)
        switch (item.props.state) {
          case '2':
          // InProgress
            activeList.push(item)
            break
          case '1':
          // Ready
            proposalList.push(item)
            break
          case '4':
          case '5':
          // Aceepted, Rejected
            finalizedList.push(item)
            break
          default: break
        }
      })
      this.data.activeItems = activeList
      this.data.proposalItems = proposalList
      this.data.finalizedItems = finalizedList

      console.log(this.data.activeItems, this.data.proposalItems, this.data.finalizedItems)
    }

    onClickDetail = (e) => {
      console.log('onClickDetailBtn: ', e.target.props, this)
    }

    onClickVote = (e) => {
      switch (e) {
        case 'N':
          break
        case 'Y':
          break
      }
    }

    render () {
      return (
        <div>
          {!this.state.newProposal
            ? <div className='contentDiv'>
              <div>
                <Input.Search
                  placeholder='Search by Type, Proposal, Keywords'
                  onSearch={value => console.log(value)}
                  enterButton
                  style={{ width: '70%', margin: '1% 0 1% 1.5%' }}
                />
                <Button className='apply_proposal_Btn' onClick={() => this.setState({ newProposal: !this.state.newProposal })}>>New Proposal</Button>
              </div>

              <h1>Active</h1>
              {this.state.isBallotLoading
                ? this.data.activeItems
                : <div>empty</div>
              }<br /><br />

              <h1>Proposals</h1>
              {this.state.isBallotLoading
                ? this.data.proposalItems
                : <div>empty</div>
              }<br /><br />

              <h1>Finalized</h1>
              {this.state.isBallotLoading
                ? this.data.finalizedItems
                : <div>empty</div>
              }<br /><br />
            </div>
            : <div>
              <ProposalForm />
            </div>
          }
        </div>
      )
    }
}
export { Voting }
