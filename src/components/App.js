import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addRecipe, removeFromCalendar } from '../actions';
import { capitalize } from '../utils/helpers';
import CalendarIcon from 'react-icons/lib/fa/calendar-plus-o';
import Modal from 'react-modal';
import ArrowRightIcon from 'react-icons/lib/fa/arrow-circle-right';
import Loading from 'react-loading';
import { fetchRecipes } from '../utils/api';
import FoodList from './FoodList';
import ShoppingList from './ShoppingList';

class App extends Component {
  state = {
    foodModalOpen: false,
    meal: null,
    day: null,
    food: null,
    ingredientsModalOpen: false,
    loadingFood: false
  };
  openFoodModal = ({ meal, day }) => {
    this.setState(() => ({
      foodModalOpen: true,
      meal,
      day
    }));
  };
  closeFoodModal = () => {
    this.setState(() => ({
      foodModalOpen: false,
      meal: null,
      day: null,
      food: null
    }));
  };
  getRecipes = async value => {
    const food = await fetchRecipes(value);

    this.setState(() => ({
      food,
      loadingFood: false
    }));
  };

  searchFood = e => {
    if (!this.input.value) {
      return;
    }

    e.preventDefault();

    this.setState(() => ({ loadingFood: true }));

    this.getRecipes(this.input.value);
  };

  openIngredientsModal = () =>
    this.setState(() => ({ ingredientsModalOpen: true }));
  closeIngredientsModal = () =>
    this.setState(() => ({ ingredientsModalOpen: false }));
  // invoked when user click'shopping List' becaudse ingredientsModalOpen become true
  generateShoppingList = () => {
    return this.props.calendar
      .reduce((result, { meals }) => {
        const { breakfast, lunch, dinner } = meals;

        breakfast && result.push(breakfast);

        lunch && result.push(lunch);
        dinner && result.push(dinner);

        return result;
      }, [])
      .reduce((ings, { ingredientLines }) => ings.concat(ingredientLines), []);
  };
  render() {
    const {
      foodModalOpen,
      loadingFood,
      food,
      ingredientsModalOpen
    } = this.state;
    const { calendar, selectRecipe, remove } = this.props;
    const mealOrder = ['breakfast', 'lunch', 'dinner'];

    return (
      <div className="container">
        <div className="nav">
          <h1 className="header">UdaciMeals</h1>
          <button className="shopping-list" onClick={this.openIngredientsModal}>
            Shopping List
          </button>
        </div>

        <ul className="meal-types">
          {mealOrder.map(mealType =>
            <li key={mealType} className="subheader">
              {capitalize(mealType)}
            </li>
          )}
        </ul>

        <div className="calendar">
          <div className="days">
            {calendar.map(({ day }) =>
              <h3 key={day} className="subheader">
                {capitalize(day)}
              </h3>
            )}
          </div>
          <div className="icon-grid">
            {calendar.map(({ day, meals }) =>
              <ul key={day}>
                {mealOrder.map(meal =>
                  <li key={meal} className="meal">
                    {meals[meal]
                      ? <div className="food-item">
                          <img
                            src={meals[meal].image}
                            alt={meals[meal].label}
                          />
                          <button onClick={() => remove({ meal, day })}>
                            Clear
                          </button>
                        </div>
                      : <button
                          onClick={() => this.openFoodModal({ meal, day })}
                          className="icon-btn"
                        >
                          <CalendarIcon size={30} />
                        </button>}
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <Modal
          className="modal"
          overlayClassName="overlay"
          isOpen={foodModalOpen}
          onRequestClose={this.closeFoodModal}
          contentLabel="Modal"
        >
          <div>
            {loadingFood === true
              ? <Loading
                  delay={200}
                  type="spin"
                  color="#222"
                  className="loading"
                />
              : <div className="search-container">
                  <h3 className="subheader">
                    Find a meal for {capitalize(this.state.day)}{' '}
                    {this.state.meal}.
                  </h3>
                  <div className="search">
                    <input
                      className="food-input"
                      type="text"
                      placeholder="Search Foods"
                      ref={input => (this.input = input)}
                    />
                    <button className="icon-btn" onClick={this.searchFood}>
                      <ArrowRightIcon size={30} />
                    </button>
                  </div>
                  {food !== null &&
                    <FoodList
                      food={food}
                      onSelect={recipe => {
                        selectRecipe({
                          recipe,
                          day: this.state.day,
                          meal: this.state.meal
                        });
                        this.closeFoodModal();
                      }}
                    />}
                </div>}
          </div>
        </Modal>

        <Modal
          className="modal"
          overlayClassName="overlay"
          isOpen={ingredientsModalOpen}
          onRequestClose={this.closeIngredientsModal}
          contentLabel="Modal"
        >
          {ingredientsModalOpen &&
            <ShoppingList list={this.generateShoppingList()} />}
        </Modal>
      </div>
    );
  }
}

function mapStateToProps({ food, calendar }) {
  const dayOrder = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ];

  return {
    calendar: dayOrder.map(day => ({
      day,
      meals: Object.keys(calendar[day]).reduce((meals, meal) => {
        meals[meal] = calendar[day][meal] ? food[calendar[day][meal]] : null;

        return meals;
      }, {})
    }))
  };
}

// by connecting this function to App componet, thes objects passed to component as props.
// when these functions are called, they are automatically going to dispach acttion to reducers.

function mapDispatchToProps(dispatch) {
  return {
    selectRecipe: data => dispatch(addRecipe(data)),
    remove: data => dispatch(removeFromCalendar(data))
  };
}

// food state
// {
//   pizza: {
//     INFO
//   }
// }

// food state
// {
//   monday: {
//     breakfast: 'pizza'
//   }
// }

// calendar state

// {calendar: Array(7), dispatch: ƒ}
// calendar:Array(7)
// 0: {day:"sunday" meals: { breakfast:null,dinner:null lunch:null }}
// __proto__
// :
// Object

export default connect(mapStateToProps, mapDispatchToProps)(App);
