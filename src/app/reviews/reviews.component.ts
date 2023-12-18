// reviews.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import ApiConnector from '../APIConnector/ApiConnector';
import { FeedbackType, Review, User } from 'src/interface/constants';
import { Validators, FormBuilder } from '@angular/forms';
import { getStars } from 'src/utils/utilityfunctions';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})

export class ReviewsComponent implements OnInit{
 /**
  * Here we are importing the getStars function from the utilityfunctions.ts file.
  * And then pass its reference to the getStars property.
  * This can be used in the HTML file to fetch the stars array
  */
  getStars = getStars;
  isLoading = false;
  reviewer: User = {} as User;
  editingReviewId: string | undefined = '';
  place_id: number;
  place_name: string;
  reviews: Review[] = [];
  showReviewForm = false;
  reviewForm = this.fb.group({
    text: ['', Validators.required],
    rating: [0, Validators.required],
    likes: [0, Validators.required]
  });

  constructor(private route: ActivatedRoute, private apiConnector: ApiConnector, private fb: FormBuilder) {
    this.place_id = Number(this.route.snapshot.paramMap.get('place_id'));
    this.place_name = String(this.route.snapshot.paramMap.get('site_name'));
   }

  ngOnInit() {
    this.isLoading = true;
    this.getLoggedInUser();
    if (!this.place_id) {
      this.getAllLatestReviews();
    } else {
      this.getReviewsForPlace(this.place_id);
    }
  }

  getAllLatestReviews() {
    this.apiConnector.getLatestReviews()
    .then((res: any) => {
      console.log('latest reviews');
      console.log(res);
      this.reviews = res.map((review: Review) => ({
        ...review,
        liked: this.isReviewLiked(review)
      }));
    })
    .catch((err: any) => {
      console.log(err);
    })
    .finally(() => {
      // Set isLoading to false to hide the loading progess bar.
      // This is being done with a timeout of 500ms,
      // so that the spinner is shown for at least 500ms.
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });
  }

  getLoggedInUser() {
    this.apiConnector.getLoggedInUser()
    .then((res: any) => {
      this.reviewer = res;
      
    })
    .catch((err: any) => {
      console.log(err);
      this.reviewer = {} as User;
    })
    .finally(() => {
      // Set isLoading to false to hide the loading progess bar.
      // This is being done with a timeout of 500ms,
      // so that the spinner is shown for at least 500ms.
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
      });
  }

  /**
   * This function is used to toggle the review form.
   */
  showForm() {
    this.showReviewForm = !this.showReviewForm;
  }

  /**
   * This function is used to fetch the reviews for a place.
   * 
   * @param place_id The id of the place for which the reviews are to be fetched.
   */
  getReviewsForPlace(place_id: number) {
    this.apiConnector.getReviewsWithUserDetails(place_id)
    .then((res: any) => {
      this.reviews = res.map((review: Review) => ({
        ...review,
        liked: this.isReviewLiked(review)
      }));
      console.log(this.reviews);
    })
    .catch((err: any) => {
      console.log(err);
    })
    .finally(() => {
      // Set isLoading to false to hide the loading progess bar.
      // This is being done with a timeout of 500ms,
      // so that the spinner is shown for at least 500ms.
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
      });
  }

  /**
   * This function is used to toggle the like/dislike of a review.
   * 
   * @param review The review object.
   */
  toggleLike(review: Review) {
    console.log('linking review')
    console.log(review);
    if (review.liked === undefined) {
      review.liked = this.isReviewLiked(review);
    }
    review.liked = !review.liked;
    let feedback = review.liked ? FeedbackType.Like : FeedbackType.Dislike;
   
     
    this.apiConnector.pushUserReviewFeedback(review.review_id?? '',this.reviewer.id ?? '', feedback)
    .then((res: any) => {
      review.likes += review.liked ? 1 : -1;
      console.log(res);
    })
    .catch((err: any) => {
      console.log(err);
    });

  }

  /**
   * This function is used to add a review.
   */
  addReview() {
    if (this.reviewForm.valid) {
       // Package the review into a Review object including other fields.
       let review: Review = {
        place_id: this.place_id,
        text: this.reviewForm.value.text as string,
        timestamp: new Date().toISOString(),
        likes: 0,
        rating: Number(this.reviewForm.value.rating),
        user_id: this.reviewer.id ? this.reviewer.id : '',
        user: this.reviewer as User
      };
      if (this.editingReviewId) {
        // Adding the review id to the review object.
        // This is required for the backend to identify the review.
        review.review_id = this.editingReviewId;
        this.apiConnector.updateReview(review)
        .then((res: any) => {
          console.log(res);
          if (this.place_id && this.place_name) {
            // Update the review in the list of reviews.
            this.getReviewsForPlace(this.place_id);
          } else {
            // Update the review in the list of reviews.
            this.getAllLatestReviews();
          }
          
          this.editingReviewId = undefined;
        })
        .catch((err: any) => {
          console.log(err);
        })
        .finally(() => {
          // Reset the form after promise is resolved or rejected.
          this.reviewForm.reset();
          this.showReviewForm = false;
        });
      } else {     
       
        this.apiConnector.addReview(review)
        .then((res: any) => {
          // Add the review to the list of reviews.
          this.reviews.push(review);
         /**
          * This is a hack to update the reviews list.
          * This is being done because the review id is generated in the server,
          * due to which frontend isn't aware of the new review id,
          * which in turn causes the delete operation to throw an error.
          * So, right after new review is added, we fetch the reviews again.
          */
          this.getReviewsForPlace(this.place_id);
        })
        .catch((err: any) => {
          console.log(err);
        })
        .finally(() => {
          // Reset the form after promise is resolved or rejected.
          this.reviewForm.reset();
          this.showReviewForm = false;
        });
      }
    }
  }

  /**
   * This function is used to edit a review.
   * 
   * @param review The review object.
   */
  editReview(review: Review) {
    // Store the id of the review being edited
   this.editingReviewId = review.review_id;
    console.log(review);
    console.log('editing review')
    // Populate the form with the review's current data
    this.reviewForm.setValue({
      text: review.text,
      rating: review.rating,
      likes: review.likes
    });

    // Show the form
    this.showReviewForm = true;
  }

  /**
   * This function is used to delete a review.
   * 
   * @param reviewId The id of the review to be deleted.
   */
  deleteReview(reviewId: string) {
    console.log(reviewId);
    console.log('deleting review')
    this.apiConnector.deleteReview(reviewId)
      .then((res: any) => {
        console.log(res);
        // Remove the review from the list of reviews.
        this.reviews = this.reviews.filter((review: Review) => {
          return review.review_id !== reviewId;
        });
      })
      .catch((err: any) => {
        console.log(err);
      })
  }

  /**
   * This function is used to check if a review is liked by the logged in user.
   * 
   * @param review The review object.
   * @returns True if the review is liked by the logged in user, false otherwise.
   */
  isReviewLiked(review: Review): boolean {
    console.log(review.review_id);
    let liked = false;

    if (review && review.review_id && this.reviewer.likedReviews?.includes(review.review_id)) {
      liked = true;
    } else {
      liked = false;
    }
    review.liked = liked;
    
    return review.liked;
  }
}
