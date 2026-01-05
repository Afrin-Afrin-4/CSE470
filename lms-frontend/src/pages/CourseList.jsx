import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import './CourseList.css';

// Simple debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchCourses();
  }, [debouncedSearchTerm, filterLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Build query parameters
      const params = {};

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (filterLevel) {
        params.level = filterLevel;
      }

      const res = await axios.get('/api/courses', { params });
      // Filter to show only published courses (done on backend now)
      setCourses(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch courses');
      setLoading(false);
    }
  };

  const getUniqueLevels = () => {
    // We'll fetch unique levels from the backend in a real implementation
    // For now, we'll use a predefined list
    return ['beginner', 'intermediate', 'advanced'];
  };

  // Show loading indicator when searching
  const isSearching = searchTerm !== debouncedSearchTerm;

  if (loading && !isSearching) {
    return <div className="course-list">Loading...</div>;
  }

  if (error) {
    return <div className="course-list">Error: {error}</div>;
  }

  return (
    <div className="course-list">
      <div className="course-list-header">
        <h1>Explore Our Courses</h1>
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search courses..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            {getUniqueLevels().map(level => (
              <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {isSearching && <div className="search-status">Searching...</div>}

      {!isSearching && courses.length > 0 ? (
        <div className="courses-grid">
          {courses.map((course) => (
            <Link key={course._id} to={`/courses/${course._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <CourseCard course={course} />
            </Link>
          ))}
        </div>
      ) : !isSearching && courses.length === 0 ? (
        <div className="no-courses">
          <h3>No Courses Found</h3>
          <p>We couldn't find any courses matching your criteria. Try adjusting your search or filters.</p>
          <button className="btn" onClick={() => {
            setSearchTerm('');
            setFilterLevel('');
          }}>
            Clear Filters
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default CourseList;