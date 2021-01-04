class SearchAndFilter {
  searchAndFilter(courses, search, subject, interest,minimumCredits, maximumCredits) {

  
    if(subject !== '' && search !== null && interest !== '') {
      let coursesAfterSearch = [];

      for(const course of courses) {
        for(const keyword of course.keywords)
        {
          if(keyword.includes(search)){
          coursesAfterSearch.push(course);
          break;
          }
        } 
      }
      courses = coursesAfterSearch;
    }


    if(subject !== 'All') {
      let coursesAfterSubject = [];

      for(const course of courses) { 
        if(course.subject === subject)
          coursesAfterSubject.push(course);
      }
      courses = coursesAfterSubject;
    }

    if(interest !== 'All') {
      let coursesAfterInterest = [];

      for(const course of courses) { 
        if(course.keywords.includes(interest))
          coursesAfterInterest.push(course);
      }
      courses = coursesAfterInterest;
    }

    if(minimumCredits !== '') {
      let coursesAfterMinimumCredits = [];

      for(const course of courses) { 
        if(course.credits >= parseInt(minimumCredits))
          coursesAfterMinimumCredits.push(course);
      }
      courses = coursesAfterMinimumCredits;
    }

    if(maximumCredits !== '') {
      let coursesAfterMaximumCredits = [];

      for(const course of courses) { 
        if(course.credits <= parseInt(maximumCredits))
          coursesAfterMaximumCredits.push(course);
      }
      courses = coursesAfterMaximumCredits;
    }

    return courses;
  }
}

export default SearchAndFilter;
