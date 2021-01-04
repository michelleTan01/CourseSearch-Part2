import React from 'react';
import './App.css';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

class Course extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      showModal: false,
      showAddModal: false,
      showRemoveModal: false
    }
    this.hasAllReq = false;
  }

  checkReq(isModal) {
    let hasReqs = this.props.hasReqs;
    let reqFulfilled = false;
    let index = -1;
    for (let i = 0; i < hasReqs.length; i++) {
      if (hasReqs[i].courseNum === this.props.data.number) {
        index = i;
        reqFulfilled = hasReqs[i].hasReq;
        break;
      }
    }
    if (reqFulfilled) {
      this.hasAllReq = true;
      return (
        <Alert key={"reqStatus"} variant={'success'}>
          You have completed the requisites for this course!
        </Alert>
      );
    } else {
      return (
        // <div>
        //   <Alert key={"reqStatus"} variant={'danger'}>
        //     You have not completed the requisites for this course!
        //   </Alert>
        //   <Alert key={"coursePath"} variant={'primary'}>
        //     <p style={{ fontWeight: "bold" }}>Possible course path: </p>
        //     {this.displayCoursePath("", index)}
        //   </Alert>
        // </div>
        <OverlayTrigger
          key={'reqNotFulfilled'}
          placement={'right'}
          overlay={
            <Tooltip id={`tooltip-${'reqNotFulfilled'}`}>
              <p style={{ fontWeight: "bold" }}>Possible course path: </p>
              {this.displayCoursePath("", index)}
            </Tooltip>
          }
        >
          <Alert key={"reqStatus"} variant={'danger'}>
             You have not completed the requisites for this course!
          </Alert>
        </OverlayTrigger>

      )
    }
  }

  displayCoursePath(output, index) {
    let hasReq = this.props.hasReqs[index].coursePath;
    //go through the outmost list that stores objects
    for (let i = 0; i < hasReq.length; i++) {
      let temp = hasReq[i];
      //call helper for string inside the current object(which includes a course name and its required courses as objects)
      output = output.concat(this.coursePathHelper(temp));
      console.log(output)
      if (i < hasReq.length - 1) {
        output = output.concat(" and ");
      }
    }
    return output + " -> This Course";

  }
  coursePathHelper(obj) {
    //base case - return current course name
    if (obj.require.length === 0) {
      return obj.course;
    }
    let result = "";
    //go through all required courses
    for (let i = 0; i < obj.require.length; i++) {
      let temp = obj.require[i];
      //recursively call this helper
      result = result.concat(this.coursePathHelper(temp));
      //console.log(result)
      if (i < obj.require.length - 1) {
        result = result.concat(" and ");
      }
    }
    result = result.concat(" -> " + obj.course);
    return result;
  }

  setFutureCourse() {
    if (this.props.cartMode && !this.hasAllReq) {
      return (
        <Button variant='dark' onClick={() => this.props.setHighPriority(this.props.data)}>
          Take in the Future
        </Button>
      );
    }
  }

  render() {
    return (
      <Card style={{ width: '36%', marginTop: '5px', marginBottom: '5px' }}>
        <Card.Body>
          {this.checkReq(false)}

          <Card.Title>
            <div style={{ maxWidth: 250 }}>
              {this.props.data.name}
            </div>
            {this.getExpansionButton()}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{this.props.data.number} - {this.getCredits()}</Card.Subtitle>
          {this.getDescription()}

          <Button variant='dark' onClick={() => this.openModal()}>View sections</Button>

          {this.setFutureCourse()}

        </Card.Body>
        <Modal show={this.state.showModal} onHide={() => this.closeModal()} centered>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.data.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.checkReq(false)}
            {this.getSections()}
          </Modal.Body>
          <Modal.Footer>
            {this.getCourseButton()}
            <Button variant="secondary" onClick={() => this.closeModal()}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showAddModal} onHide={() => this.closeAddModal()} centered>
          <Modal.Header closeButton>
          </Modal.Header>
          <Modal.Body>
            {this.checkReq(true)}
            You have successfully added a course/section/subsection.
            <br></br>
            Please refer to Cart for more details!
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.closeAddModal()}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showRemoveModal} onHide={() => this.closeRemoveModal()} centered>
          <Modal.Header closeButton>
          </Modal.Header>
          <Modal.Body>
            You have successfully removed a course/section/subsection.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.closeRemoveModal()}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    )
  }

  getCourseButton() {
    let buttonVariant = 'dark';
    let buttonOnClick = () => this.addCourse();
    let buttonText = 'Add Course';

    if (this.props.courseKey in this.props.cartCourses) {
      buttonVariant = 'outline-dark';
      buttonOnClick = () => this.removeCourse();
      buttonText = 'Remove Course'
    }

    return (
      <Button variant={buttonVariant} onClick={buttonOnClick}>
        {buttonText}
      </Button>
    )
  }

  getSections() {
    let sections = [];


    for (let i = 0; i < this.props.data.sections.length; i++) {
      sections.push(
        <Card key={i}>
          <Accordion.Toggle as={Card.Header} variant="link" eventKey={i} style={{ height: 63, display: 'flex', alignItems: 'center' }}>
            {"Section " + i}
            {this.getSectionButton(i)}
          </Accordion.Toggle>
          <Accordion.Collapse eventKey={i}>
            <Card.Body>
              {JSON.stringify(this.props.data.sections[i].time)}
              {this.getSubsections(i, this.props.data.sections[i])}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      )
    }

    return (
      <Accordion defaultActiveKey="0">
        {sections}
      </Accordion>
    )
  }

  getSectionButton(section) {
    let buttonVariant = 'dark';
    let buttonOnClick = (e) => this.addSection(e, section);
    let buttonText = 'Add Section';

    if (this.props.courseKey in this.props.cartCourses) {
      if (section in this.props.cartCourses[this.props.courseKey]) {
        buttonVariant = 'outline-dark';
        buttonOnClick = (e) => this.removeSection(e, section);
        buttonText = 'Remove Section';
      }
    }

    return <Button variant={buttonVariant} onClick={buttonOnClick} style={{ position: 'absolute', right: 20 }}>{buttonText}</Button>
  }

  addCourse() {
    this.props.addCartCourse(
      {
        course: this.props.courseKey
      }
    );
    this.openAddModal();
  }

  removeCourse() {
    this.props.removeCartCourse(
      {
        course: this.props.courseKey
      }
    );
    this.openRemoveModal();
  }

  addSection(e, section) {
    e.stopPropagation();
    this.props.addCartCourse(
      {
        course: this.props.courseKey,
        section: section
      }
    );
    this.openAddModal();
  }

  removeSection(e, section) {
    e.stopPropagation();
    this.props.removeCartCourse(
      {
        course: this.props.courseKey,
        section: section
      }
    );
    this.openRemoveModal();
  }

  addSubsection(e, section, subsection) {
    e.stopPropagation();
    this.props.addCartCourse(
      {
        course: this.props.courseKey,
        section: section,
        subsection: subsection
      }
    );
    this.openAddModal();
  }

  removeSubsection(e, section, subsection) {
    e.stopPropagation();
    this.props.removeCartCourse(
      {
        course: this.props.courseKey,
        section: section,
        subsection: subsection
      }
    );
    this.openRemoveModal();

  }

  getSubsections(sectionKey, sectionValue) {
    let subsections = [];

    for (let i = 0; i < sectionValue.subsections.length; i++) {
      subsections.push(
        <Card key={i}>
          <Accordion.Toggle as={Card.Header} variant="link" eventKey={i} style={{ height: 63, display: 'flex', alignItems: 'center' }}>
            {i}
            {this.getSubsectionButton(sectionKey, i)}
          </Accordion.Toggle>
          <Accordion.Collapse eventKey={i}>
            <Card.Body>
              {JSON.stringify(sectionValue.subsections[i].time)}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      )
    }

    return (
      <Accordion defaultActiveKey="0">
        {subsections}
      </Accordion>
    )
  }

  getSubsectionButton(section, subsection) {
    let buttonVariant = 'dark';
    let buttonOnClick = (e) => this.addSubsection(e, section, subsection);
    let buttonText = 'Add Subsection';

    if (this.props.courseKey in this.props.cartCourses) {
      if (section in this.props.cartCourses[this.props.courseKey]) {
        if (this.props.cartCourses[this.props.courseKey][section].indexOf(subsection) > -1) {
          buttonVariant = 'outline-dark';
          buttonOnClick = (e) => this.removeSubsection(e, section, subsection);
          buttonText = 'Remove Subsection';
        }
      }
    }

    return <Button variant={buttonVariant} onClick={buttonOnClick} style={{ position: 'absolute', right: 20 }}>{buttonText}</Button>
  }
  openAddModal() {
    this.setState({ showAddModal: true });
  }

  closeAddModal() {
    this.setState({ showAddModal: false });
  }

  openRemoveModal() {
    this.setState({ showRemoveModal: true });
  }

  closeRemoveModal() {
    this.setState({ showRemoveModal: false });
  }

  openModal() {
    this.setState({ showModal: true });
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  setExpanded(value) {
    this.setState({ expanded: value });
  }

  getExpansionButton() {
    let buttonText = '▼';
    let buttonOnClick = () => this.setExpanded(true);

    if (this.state.expanded) {
      buttonText = '▲';
      buttonOnClick = () => this.setExpanded(false)
    }

    return (
      <Button variant='outline-dark' style={{ width: 25, height: 25, fontSize: 12, padding: 0, position: 'absolute', right: 20, top: 20 }} onClick={buttonOnClick}>{buttonText}</Button>
    )
  }

  getDescription() {
    if (this.state.expanded) {
      return (
        <div>
          {this.props.data.description}
        </div>
      )
    }
  }

  getCredits() {
    if (this.props.data.credits === 1)
      return '1 credit';
    else
      return this.props.data.credits + ' credits';
  }
}

export default Course;
