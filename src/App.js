import React from 'react';
import './App.css';
import Sidebar from './Sidebar';
import CourseArea from './CourseArea';
import PrevCourseArea from './PrevCourseArea';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allCourses: [],
      filteredCourses: [],
      subjects: [],
      keywords: [],
      cartCourses: {},
      previousCourses: [],
      ratings: [],
      recommended: [],
      hasReqs: [],
      highPriorityCourses: [],
      credits: 0
    };
  }



  componentDidMount() {
    this.loadInitialState()
  }

  async loadInitialState() {
    let courseURL = "http://mysqlcs639.cs.wisc.edu:53706/api/react/classes";
    let courseData = await (await fetch(courseURL)).json()
    let prevURL = "http://mysqlcs639.cs.wisc.edu:53706/api/react/students/5022025924/classes/completed";
    let prevData = await (await fetch(prevURL)).json()

    this.setState({ allCourses: courseData, filteredCourses: courseData, subjects: this.getSubjects(courseData), keywords: this.getKeywords(courseData), previousCourses: this.getPreviousCourses(courseData, prevData), ratings: this.initializeRatings(prevData), hasReqs: this.getHasReqs(courseData, prevData) });
  }

  setHighPriority(course) {
    let temp = this.state.highPriorityCourses;
    let reqs = course.requisites;
    console.log(reqs)
    for (let i = 0; i < reqs.length; i++) {
      for (let j = 0; j < reqs[i].length; j++) {
        console.log(temp);
        if (!this.inPrevCourse(course.number) && !temp.includes(course.number)) {
          temp.push(reqs[i][j]);
        }
        let tempReq = this.getCourseByNumber(reqs[i][j], this.state.allCourses).requisites;
        for (let k = 0; k < tempReq.length; k++) {
          for (let l = 0; l < tempReq[k].length; l++) {
            if (!this.inPrevCourse(course.number) && !temp.includes(course.number)) {
              temp.push(tempReq[k][l]);
            }
          }
        }
      }
    }
    this.setState({
      highPriorityCourses: temp
    })
    console.log("set priority")
    console.log(this.state.highPriorityCourses)
    this.setState({
      recommended: this.setRecommended()
    })
  }

  getHasReqs(courseData, prevData) {
    let result = [];
    console.log("initializing hasReq")
    for (var i = 0; i < courseData.length; i++) {
      let curr = courseData[i];
      let obj = {};
      obj["courseNum"] = curr["number"];
      obj["hasReq"] = this.checkReq(curr, prevData);
      obj["coursePath"] = this.getCoursePath(curr, prevData, courseData);
      result.push(obj);
    }
    return result;
  }

  getCoursePath(course, prevData, allCourses) {
    //base case
    if (this.checkReq(course, prevData)) {
      return [];
    }
    if (course !== -1) {
      let req = course.requisites;
      let result = [];
      //go through all required courses for the current course
      for (let j = 0; j < req.length; j++) {
        let obj = {};
        console.log("get course by number in path finding")
        let tempReq = this.getCourseByNumber(req[j][0], allCourses);
        //if this course is not already taken, then add to coursepath
        if (!prevData.data.includes(tempReq.number)) {
          obj["course"] = req[j][0];
          obj["require"] = this.getCoursePath(tempReq, prevData, allCourses);
          result.push(obj);
        }
      }
      return result;
    }
  }

  checkReq(course, prevCourses) {

    let prev = prevCourses.data;
    let req = course.requisites;
    let num = course.number;
    if (course === -1) {

      return false;
    }
    if (req.length === 0) {
      return true;
    }
    if (prev.includes(num)) {
      return true;
    }
    for (let j = 0; j < req.length; j++) {
      let tempReq = req[j];
      let haveReq = false;
      for (let k = 0; k < tempReq.length; k++) {
        if (prev.includes(tempReq[k])) {
          haveReq = true;
          break;
        }
      }
      if (!haveReq) {
        return false;
      }
    }
    return true;

  }

  getPreviousCourses(courseData, prevData) {
    let result = [];
    var course;
    for (var i = 0; i < courseData.length; i++) {
      course = courseData[i];
      if (prevData.data.includes(course["number"])) {
        result.push(course)
      }
    }
    return result;
  }

  initializeRatings(prevData) {
    let result = [];
    for (let i = 0; i < prevData.data.length; i++) {
      let curr = prevData.data[i];
      let obj = {};
      obj["courseNum"] = curr;
      obj["rating"] = "No Rating";
      result.push(obj);
    }
    return result;
  }

  setRatings(course, r) {
    let temp = this.state.ratings;
    for (const k in temp) {
      if (temp[k].courseNum === course.number) {
        temp[k].rating = r;
        break;
      }
    }
    this.setState({
      ratings: temp,
      recommended: this.setRecommended()
    });
  }

  getCourseByNumber(num, allCourses) {
    let data = allCourses;
    for (var i = 0; i < data.length; i++) {
      let course = data[i];
      if (course["number"].toString() === num.toString()) {

        return course;
      }
    }
    return -1;
  }

  getRecKeywords() {
    let recKeywords = [];
    let currRating = this.state.ratings;
    console.log("in get rec keywords")
    for (const i in currRating) {
      let temp = currRating[i];
      //check through all rated courses
      if (temp.rating !== "No Rating") {
        //only record keywords of courses rated 4 stars or more
        if (temp.rating.length >= 4) {
          let currCourse = this.getCourseByNumber(temp.courseNum, this.state.allCourses);
          let kwlist = currCourse.keywords; //keyword list of current course
          //run through all keywords and add the ones not already in recKeywords
          for (let j = 0; j < kwlist.length; j++) {
            if (recKeywords.indexOf(kwlist[j]) === -1) {
              recKeywords.push(kwlist[j]);
            }
          }
        }
      }
    }
    return recKeywords;
  }

  inPrevCourse(num) {
    let data = this.state.previousCourses;
    for (let i = 0; i < data.length; i++) {
      if (data[i].number === num) {
        return true;
      }
    }
    return false;
  }

  setRecommended() {
    let result = [];
    let nums = [];//keep track of course number added to result
    let recKeywords = this.getRecKeywords();
    let data = this.state.allCourses;
    //run through all courses
    for (let i = 0; i < data.length; i++) {
      let course = data[i];
      //not already taken
      if (!this.inPrevCourse(course.number)) {
        for (let j = 0; j < recKeywords.length; j++) {
          let word = recKeywords[j];
          //add only if course has this keyword and not already in result
          if (course.keywords.includes(word) && !nums.includes(course.number)) {
            console.log("recommend");
            result.push(course);
            nums.push(course.number);
          }
        }
      }
    }
    console.log(result);
    result = this.changeRecPriority(result);
    console.log(result);
    return result;
  }
  changeRecPriority(result) {
    let priority = this.state.highPriorityCourses;
    for (let i = 0; i < result.length; i++) {
      if (priority.includes(result[i].number)) {
        let temp = result[i];
        result.splice(i, 1);
        result = [temp, ...result];
      }
    }
    return result;
  }
  getSubjects(data) {
    let subjects = [];
    subjects.push("All");

    for (let i = 0; i < data.length; i++) {
      if (subjects.indexOf(data[i].subject) === -1)
        subjects.push(data[i].subject);
    }

    return subjects;
  }

  getKeywords(data) {
    let keywords = [];
    keywords.push("All");
    for (let i = 0; i < data.length; i++) {
      let temp = data[i].keywords;
      for (let j = 0; j < temp.length; j++) {
        if (keywords.indexOf(temp[j]) === -1) {
          keywords.push(temp[j]);
        }
      }
    }
    return keywords;
  }

  setCourses(courses) {
    this.setState({ filteredCourses: courses })
  }

  addCartCourse(data) {
    let currCred = this.state.credits;
    let newCartCourses = JSON.parse(JSON.stringify(this.state.cartCourses))// I think this is a hack to deepcopy
    let courseIndex = this.state.allCourses.findIndex((x) => { return x.number === data.course })
    if (courseIndex === -1) {
      return
    }

    if ('subsection' in data) {
      if (data.course in this.state.cartCourses) {
        if (data.section in this.state.cartCourses[data.course]) {
          newCartCourses[data.course][data.section].push(data.subsection);
        }
        else {
          newCartCourses[data.course][data.section] = [];
          newCartCourses[data.course][data.section].push(data.subsection);
        }
      }
      else {
        newCartCourses[data.course] = {};
        newCartCourses[data.course][data.section] = [];
        newCartCourses[data.course][data.section].push(data.subsection);
        
        currCred += this.state.allCourses.find((x) => { return x.number === data.course}).credits
      }
    }
    else if ('section' in data) {
      if (data.course in this.state.cartCourses) {
        newCartCourses[data.course][data.section] = [];

        for (let i = 0; i < this.state.allCourses[courseIndex].sections[data.section].subsections.length; i++) {
          newCartCourses[data.course][data.section].push(this.state.allCourses[courseIndex].sections[data.section].subsections[i]);
        }

      }
      else {
        newCartCourses[data.course] = {};
        newCartCourses[data.course][data.section] = [];
        for (let i = 0; i < this.state.allCourses[courseIndex].sections[data.section].subsections.length; i++) {
          newCartCourses[data.course][data.section].push(this.state.allCourses[courseIndex].sections[data.section].subsections[i]);
        }
        
        currCred += this.state.allCourses.find((x) => { return x.number === data.course}).credits
      }
    }
    else {
      newCartCourses[data.course] = {};


      for (let i = 0; i < this.state.allCourses[courseIndex].sections.length; i++) {
        newCartCourses[data.course][i] = [];

        for (let c = 0; c < this.state.allCourses[courseIndex].sections[i].subsections.length; c++) {
          newCartCourses[data.course][i].push(this.state.allCourses[courseIndex].sections[i].subsections[c]);
        }

      }
      
      currCred += this.state.allCourses.find((x) => { return x.number === data.course }).credits;

    }

    this.setState({
      cartCourses: newCartCourses,
      credits: currCred
    });
  }

  removeCartCourse(data) {
    let newCartCourses = JSON.parse(JSON.stringify(this.state.cartCourses))
    let currCred = this.state.credits;
    if ('subsection' in data) {
      newCartCourses[data.course][data.section].splice(newCartCourses[data.course][data.section].indexOf(data.subsection), 1);
      if (newCartCourses[data.course][data.section].length === 0) {
        delete newCartCourses[data.course][data.section];
      }
      if (Object.keys(newCartCourses[data.course]).length === 0) {
        delete newCartCourses[data.course];

        currCred -= this.state.allCourses.find((x) => { return x.number === data.course }).credits
      }
    }
    else if ('section' in data) {
      delete newCartCourses[data.course][data.section];
      if (Object.keys(newCartCourses[data.course]).length === 0) {
        delete newCartCourses[data.course];

        currCred -= this.state.allCourses.find((x) => { return x.number === data.course }).credits
      }
    }
    else {
      delete newCartCourses[data.course];

      currCred -= this.state.allCourses.find((x) => { return x.number === data.course }).credits
    }
    
    this.setState({
      cartCourses: newCartCourses,
      credits: currCred
    });
  }

  getCartData() {
    let cartData = [];

    for (const courseKey of Object.keys(this.state.cartCourses)) {
      let course = this.state.allCourses.find((x) => { return x.number === courseKey })

      cartData.push(course);
    }
    return cartData;
  }

  getCartTitle() {
    let numCourses = Object.keys(this.state.cartCourses).length;
    if (numCourses === 0) {
      return "Cart";
    } else if (numCourses === 1) {
      return "Cart | " + numCourses + " Course";
    } else {
      return "Cart | " + numCourses + " Courses";
    }
  }

  clearCart(){
    this.setState({
      cartCourses:{},
      credits: 0
    });
  }

  getEmptyMsg(){
    console.log(this.state.filteredCourses)
    if(this.state.filteredCourses.length === 0){
      return(
        <p style={{marginLeft: 'calc(20vw + 10px)', marginTop: '30px'}}>No results found for your search.</p>
      )
    }
  }
  
  render() {
    //console.log(this.state.hasReqs)
    console.log("render")
    console.log(Object.keys(this.state.cartCourses).length)
    return (
      <>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />

        <Tabs defaultActiveKey="search" style={{ position: 'fixed', zIndex: 1, width: '100%', backgroundColor: 'white' }}>
          <Tab eventKey="search" title="Search" style={{ paddingTop: '5vh' }}>
            <Sidebar setCourses={(courses) => this.setCourses(courses)} courses={this.state.allCourses} subjects={this.state.subjects} keywords={this.state.keywords} />
            {this.getEmptyMsg()}
            <div style={{ marginLeft: '20vw' }}>
              <CourseArea data={this.state.filteredCourses} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} prevCourses={this.state.previousCourses} hasReqs={this.state.hasReqs} cartMode={false} setHighPriority={this.setHighPriority.bind(this)} />
            </div>
          </Tab>

          <Tab eventKey="cart" title={this.getCartTitle()} style={{ paddingTop: '5vh' }}>
            <Card style={{ width: 'calc(20vw - 5px)', marginLeft: '5px', height: 'calc(100vh - 52px)', position: 'fixed' }}>
              <Card.Body>
                <Card.Title>Welcome to Cart!</Card.Title>
                <p>There are {Object.keys(this.state.cartCourses).length} course(s) in Cart.</p>
                <br></br>
                <p>There are {this.state.credits} credit(s) in Cart.</p>
                <br></br>
                <Button variant='danger' onClick={() => this.clearCart()}>Clear Cart</Button>
              </Card.Body>
            </Card>
            <div style={{ marginLeft: '20vw' }}>
              <CourseArea data={this.getCartData()} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} prevCourses={this.state.previousCourses} hasReqs={this.state.hasReqs} cartMode={true} setHighPriority={this.setHighPriority.bind(this)} />
            </div>
          </Tab>

          <Tab eventKey="prevCourses" title="Courses Taken" style={{ paddingTop: '5vh' }}>
            <div style={{ marginLeft: '20vw' }}>
              <PrevCourseArea data={this.state.previousCourses} ratings={this.state.ratings} setRatings={this.setRatings.bind(this)} />
            </div>
          </Tab>

          <Tab eventKey="recommend" title="Course Recommendations" style={{ paddingTop: '5vh' }}>
            <div style={{ marginLeft: '20vw' }}>
              <CourseArea data={this.state.recommended} addCartCourse={(data) => this.addCartCourse(data)} removeCartCourse={(data) => this.removeCartCourse(data)} cartCourses={this.state.cartCourses} prevCourses={this.state.previousCourses} hasReqs={this.state.hasReqs} cartMode={false} setHighPriority={this.setHighPriority.bind(this)} />
            </div>
          </Tab>
        </Tabs>
      </>
    )
  }
}

export default App;
